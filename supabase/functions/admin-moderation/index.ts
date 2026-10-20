/*
# Admin moderation edge function for MadaFF Hub

POST-only. Authenticates via a passphrase checked against a SHA-256 hash
stored in `admin_settings`, then performs moderation actions using the
service role (which bypasses RLS).

Actions:
- verify: check passphrase, return pending events + open reports + audit log
- set_event_status: update publication/verification status of an event
- resolve_report: set a report's status (+ moderator notes)
- set_announcement: update the homepage announcement

Passes the passphrase only over HTTPS POST; never stored in the browser.
Every action writes an audit_logs row.
*/
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);

  try {
    const body = await req.json();
    const passphrase: string = typeof body.passphrase === 'string' ? body.passphrase : '';
    const action: string = typeof body.action === 'string' ? body.action : '';

    if (!passphrase) return json({ error: 'Phrase secrète requise' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Rate limiting: max 10 failed attempts per IP per 10 minutes.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'inconnu';
    const windowStart = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .eq('action', 'admin_login_failed')
      .eq('entity_type', 'rate_limit')
      .eq('entity_id', ip)
      .gte('created_at', windowStart);
    if ((count ?? 0) >= 10) return json({ error: 'Trop de tentatives. Réessayez plus tard.' }, 429);

    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('passphrase_hash')
      .eq('id', 'main')
      .maybeSingle();

    if (settingsError || !settings) return json({ error: 'Configuration indisponible' }, 500);

    const hash = await sha256Hex(passphrase);
    if (hash !== settings.passphrase_hash) {
      await supabase.from('audit_logs').insert({
        action: 'admin_login_failed',
        entity_type: 'rate_limit',
        entity_id: ip,
        details: 'Échec de connexion à l\'administration',
      });
      return json({ error: 'Phrase secrète incorrecte' }, 401);
    }

    switch (action) {
      case 'verify': {
        const [pending, allEvents, openReports, logs, settingsRow, allCreators, pendingCreators] = await Promise.all([
          supabase
            .from('events')
            .select('*')
            .eq('publication_status', 'en_attente')
            .order('created_at', { ascending: true })
            .limit(100),
          supabase
            .from('events')
            .select('id,title,slug,publication_status,verification_status,starts_at,updated_at,organizer_name')
            .order('updated_at', { ascending: false })
            .limit(200),
          supabase
            .from('reports')
            .select('*')
            .in('status', ['nouveau', 'en_examen'])
            .order('created_at', { ascending: true })
            .limit(100),
          supabase
            .from('audit_logs')
            .select('*')
            .neq('entity_type', 'rate_limit')
            .order('created_at', { ascending: false })
            .limit(50),
          supabase.from('site_settings').select('*').eq('id', 'main').maybeSingle(),
          supabase
            .from('creators')
            .select('id,name,slug,publication_status,is_featured,updated_at')
            .order('updated_at', { ascending: false })
            .limit(200),
          supabase
            .from('creators')
            .select('*')
            .eq('publication_status', 'en_attente')
            .order('created_at', { ascending: true })
            .limit(100),
        ]);

        return json({
          pendingEvents: pending.data ?? [],
          events: allEvents.data ?? [],
          openReports: openReports.data ?? [],
          auditLogs: logs.data ?? [],
          announcement: settingsRow.data?.announcement ?? null,
          creators: allCreators.data ?? [],
          pendingCreators: pendingCreators.data ?? [],
        });
      }

      case 'set_event_status': {
        const eventId = String(body.event_id ?? '');
        const publication = body.publication_status ?? null;
        const verification = body.verification_status ?? null;
        if (!eventId) return json({ error: 'Identifiant d\'événement requis' }, 400);

        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (publication) {
          patch.publication_status = publication;
          if (publication === 'publie') {
            patch.published_at = new Date().toISOString();
            patch.verification_status = 'verifie';
            patch.last_verified_at = new Date().toISOString();
          }
        }
        if (verification) patch.verification_status = verification;

        const { error } = await supabase.from('events').update(patch).eq('id', eventId);
        if (error) return json({ error: 'Mise à jour impossible' }, 400);

        await supabase.from('audit_logs').insert({
          action: 'update_event_status',
          entity_type: 'event',
          entity_id: eventId,
          details: `publication=${publication ?? '-'} verification=${verification ?? '-'}`,
        });
        return json({ ok: true });
      }

      case 'resolve_report': {
        const reportId = String(body.report_id ?? '');
        const status = String(body.status ?? '');
        const notes = typeof body.moderator_notes === 'string' ? body.moderator_notes : null;
        if (!reportId || !['nouveau', 'en_examen', 'resolu', 'rejete'].includes(status)) {
          return json({ error: 'Paramètres de signalement invalides' }, 400);
        }

        const { error } = await supabase
          .from('reports')
          .update({
            status,
            moderator_notes: notes,
            resolved_at: status === 'resolu' || status === 'rejete' ? new Date().toISOString() : null,
          })
          .eq('id', reportId);
        if (error) return json({ error: 'Mise à jour impossible' }, 400);

        await supabase.from('audit_logs').insert({
          action: 'resolve_report',
          entity_type: 'report',
          entity_id: reportId,
          details: `statut=${status}`,
        });
        return json({ ok: true });
      }

      case 'set_creator_status': {
        const creatorId = String(body.creator_id ?? '');
        const publication = String(body.publication_status ?? '');
        if (!creatorId || !['en_attente', 'publie', 'refuse'].includes(publication)) {
          return json({ error: 'Paramètres de créateur invalides' }, 400);
        }

        const patch: Record<string, unknown> = {
          publication_status: publication,
          updated_at: new Date().toISOString(),
        };
        if (publication === 'publie') {
          patch.verified_at = new Date().toISOString();
        }

        const { error } = await supabase.from('creators').update(patch).eq('id', creatorId);
        if (error) return json({ error: 'Mise à jour impossible' }, 400);

        await supabase.from('audit_logs').insert({
          action: 'update_creator_status',
          entity_type: 'creator',
          entity_id: creatorId,
          details: `publication=${publication}`,
        });
        return json({ ok: true });
      }

      case 'create_creator': {
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const bio = typeof body.bio === 'string' ? body.bio.trim() : '';
        const categories = Array.isArray(body.categories)
          ? body.categories.filter((c: unknown) => typeof c === 'string' && c.trim()).slice(0, 6)
          : [];
        const rawLinks = Array.isArray(body.links) ? body.links.slice(0, 8) : [];
        const links = rawLinks
          .map((l: unknown) => {
            if (!l || typeof l !== 'object') return null;
            const obj = l as Record<string, unknown>;
            const label = typeof obj.label === 'string' ? obj.label.trim().slice(0, 60) : '';
            const url = typeof obj.url === 'string' ? obj.url.trim().slice(0, 500) : '';
            if (!url.startsWith('https://') && !url.startsWith('http://')) return null;
            return { label: label || 'Lien', url };
          })
          .filter(Boolean);
        if (!name || name.length > 80) return json({ error: 'Nom requis (80 caractères max)' }, 400);
        if (bio.length > 600) return json({ error: 'Présentation trop longue (600 caractères max)' }, 400);

        const slug = name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (!slug) return json({ error: 'Nom invalide pour générer un identifiant' }, 400);

        const { data: existing } = await supabase
          .from('creators')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        if (existing) return json({ error: 'Un créateur avec ce nom existe déjà' }, 409);

        const { error } = await supabase.from('creators').insert({
          name,
          slug,
          bio: bio || null,
          categories,
          links,
          publication_status: 'en_attente',
        });
        if (error) return json({ error: 'Création impossible' }, 400);

        await supabase.from('audit_logs').insert({
          action: 'create_creator',
          entity_type: 'creator',
          entity_id: slug,
          details: `nom=${name}`,
        });
        return json({ ok: true });
      }

      case 'set_announcement': {
        const announcement = typeof body.announcement === 'string' ? body.announcement.trim() : '';
        if (announcement.length > 500) return json({ error: 'Annonce trop longue (500 caractères max)' }, 400);

        const { error } = await supabase
          .from('site_settings')
          .update({ announcement, updated_at: new Date().toISOString() })
          .eq('id', 'main');
        if (error) return json({ error: 'Mise à jour impossible' }, 400);

        await supabase.from('audit_logs').insert({
          action: 'set_announcement',
          entity_type: 'settings',
          entity_id: 'main',
          details: announcement ? 'Annonce mise à jour' : 'Annonce effacée',
        });
        return json({ ok: true });
      }

      default:
        return json({ error: 'Action inconnue' }, 400);
    }
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erreur interne' }, 500);
  }
});
