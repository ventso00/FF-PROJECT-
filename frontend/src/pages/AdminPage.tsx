import { useState, type FormEvent } from 'react';
import { ADMIN_FUNCTION_URL } from '@/lib/supabase';
import type { AdminSnapshot, Creator, EventRow, ReportRow } from '@/lib/types';
import { REPORT_REASON_LABELS } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Page, EmptyState } from '@/components/Common';
import { PublicationBadge, ReportStatusBadge, VerificationBadge } from '@/components/Badges';
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  History,
  Inbox,
  KeyRound,
  Loader2,
  Lock,
  Megaphone,
  Plus,
  Video,
  XCircle,
} from 'lucide-react';

type Tab = 'pending' | 'reports' | 'events' | 'creators' | 'logs' | 'announcement';

export default function AdminPage() {
  const [passphrase, setPassphrase] = useState('');
  const [checking, setChecking] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);

  async function callAdmin(action: string, extra: Record<string, unknown> = {}) {
    const response = await fetch(ADMIN_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase, action, ...extra }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body || body.error) {
      throw new Error(body?.error ?? `La requête a échoué (${response.status})`);
    }
    return body;
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!passphrase) return;
    setChecking(true);
    setLoginError(null);
    try {
      const data = (await callAdmin('verify')) as AdminSnapshot;
      setSnapshot(data);
      sessionStorage.setItem('madaff_admin', passphrase);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Connexion impossible');
    } finally {
      setChecking(false);
    }
  }

  async function refresh() {
    const data = (await callAdmin('verify')) as AdminSnapshot;
    setSnapshot(data);
  }

  if (!snapshot) {
    return (
      <Page>
        <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-ash-900/80 p-6 shadow-lg shadow-black/40">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ember-600 to-amber-500 text-white shadow-lg shadow-ember-500/25">
              <Lock className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-xl font-semibold uppercase tracking-wide text-white">Espace administrateur</h1>
              <p className="text-xs text-ash-400">Accès réservé à l'équipe de modération</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-pass" className="mb-1.5 block text-sm font-semibold uppercase tracking-wide text-ash-300">
                Phrase secrète de modération
              </label>
              <input
                id="admin-pass"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                autoComplete="current-password"
                className="w-full input-dark"
              />
            </div>
            {loginError && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
                {loginError}
              </p>
            )}
            <button
              type="submit"
              disabled={checking || !passphrase}
              className="inline-flex w-full items-center justify-center gap-2 btn-fire px-4 py-2.5 text-sm"
            >
              {checking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <KeyRound className="h-4 w-4" aria-hidden />}
              Se connecter
            </button>
            <p className="text-xs leading-relaxed text-ash-500">
              La phrase secrète est vérifiée côté serveur et n'est jamais enregistrée dans la base. Après 10 tentatives
              échouées, l'accès est bloqué 10 minutes.
            </p>
          </form>
        </div>
      </Page>
    );
  }

  return (
    <AdminDashboard
      snapshot={snapshot}
      callAdmin={callAdmin}
      refresh={refresh}
      onLogout={() => {
        sessionStorage.removeItem('madaff_admin');
        setSnapshot(null);
        setPassphrase('');
      }}
    />
  );
}

function AdminDashboard({
  snapshot,
  callAdmin,
  refresh,
  onLogout,
}: {
  snapshot: AdminSnapshot;
  callAdmin: (action: string, extra?: Record<string, unknown>) => Promise<unknown>;
  refresh: () => Promise<void>;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<Tab>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [announcementDraft, setAnnouncementDraft] = useState(snapshot.announcement ?? '');
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  async function run(id: string, fn: () => Promise<unknown>) {
    setBusyId(id);
    setActionError(null);
    try {
      await fn();
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action impossible');
    } finally {
      setBusyId(null);
    }
  }

  const setEventStatus = (eventId: string, publication?: string, verification?: string) =>
    run(eventId, () => callAdmin('set_event_status', { event_id: eventId, publication_status: publication, verification_status: verification }));

  const resolveReport = (reportId: string, status: string, notes?: string) =>
    run(reportId, () => callAdmin('resolve_report', { report_id: reportId, status, moderator_notes: notes ?? null }));

  const saveAnnouncement = () =>
    run('announcement', async () => {
      await callAdmin('set_announcement', { announcement: announcementDraft });
      setAnnouncementSaved(true);
      setTimeout(() => setAnnouncementSaved(false), 2500);
    });

  const setCreatorStatus = (creatorId: string, publication: string) =>
    run(creatorId, () => callAdmin('set_creator_status', { creator_id: creatorId, publication_status: publication }));

  const tabs: { id: Tab; label: string; icon: typeof Inbox; count?: number }[] = [
    { id: 'pending', label: 'À valider', icon: Inbox, count: snapshot.pendingEvents.length },
    { id: 'reports', label: 'Signalements', icon: ClipboardList, count: snapshot.openReports.length },
    { id: 'events', label: 'Tous les événements', icon: Eye },
    { id: 'creators', label: 'Créateurs', icon: Video, count: snapshot.pendingCreators.length },
    { id: 'logs', label: 'Journal', icon: History },
    { id: 'announcement', label: 'Annonce', icon: Megaphone },
  ];

  const btnPrimary =
    'inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-emerald-500 disabled:opacity-60';
  const btnGhost =
    'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-ash-200 transition hover:bg-white/10 disabled:opacity-60';

  return (
    <Page>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide heading-glare">Tableau de bord administrateur</h1>
          <p className="text-sm text-ash-400">Modération des événements, signalements et annonces.</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 rounded-lg btn-ghost px-3 py-2 text-sm"
        >
          <Lock className="h-4 w-4" aria-hidden /> Verrouiller
        </button>
      </div>

      {actionError && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300" role="alert">
          {actionError}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-ash-900/80 p-1.5">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              tab === id ? 'bg-ember-500/15 text-ember-300 ring-1 ring-ember-500/40' : 'text-ash-300 hover:bg-white/10'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
            {count !== undefined && count > 0 && (
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  tab === id ? 'bg-ember-500 text-white' : 'bg-ember-500/20 text-ember-300'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <section className="mt-6 space-y-4" aria-label="Événements en attente de validation">
          {snapshot.pendingEvents.length === 0 ? (
            <EmptyState title="Aucun événement en attente" hint="Les nouvelles propositions apparaîtront ici." />
          ) : (
            snapshot.pendingEvents.map((event) => (
              <PendingEventCard
                key={event.id}
                event={event}
                busy={busyId === event.id}
                onApprove={() => setEventStatus(event.id, 'publie')}
                onReject={() => setEventStatus(event.id, 'refuse')}
              />
            ))
          )}
        </section>
      )}

      {tab === 'reports' && (
        <section className="mt-6 space-y-4" aria-label="Signalements ouverts">
          {snapshot.openReports.length === 0 ? (
            <EmptyState title="Aucun signalement ouvert" hint="Les signalements des visiteurs apparaîtront ici." />
          ) : (
            snapshot.openReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                busy={busyId === report.id}
                onResolve={(status, notes) => resolveReport(report.id, status, notes)}
              />
            ))
          )}
        </section>
      )}

      {tab === 'events' && (
        <section className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-ash-900/80" aria-label="Tous les événements">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-ash-950/60 text-xs uppercase tracking-wide text-ash-400">
                <tr>
                  <th className="px-4 py-3">Événement</th>
                  <th className="px-4 py-3">Début</th>
                  <th className="px-4 py-3">Publication</th>
                  <th className="px-4 py-3">Vérification</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {snapshot.events.map((event) => (
                  <tr key={event.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{event.title}</p>
                      <p className="text-xs text-ash-500">{event.organizer_name}</p>
                    </td>
                    <td className="px-4 py-3 text-ash-300">{formatDateTime(event.starts_at)}</td>
                    <td className="px-4 py-3"><PublicationBadge status={event.publication_status} /></td>
                    <td className="px-4 py-3"><VerificationBadge status={event.verification_status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {event.publication_status !== 'publie' && (
                          <button type="button" className={btnPrimary} disabled={busyId === event.id}
                            onClick={() => setEventStatus(event.id, 'publie')}>
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Publier
                          </button>
                        )}
                        {event.publication_status === 'publie' && (
                          <button type="button" className={btnGhost} disabled={busyId === event.id}
                            onClick={() => setEventStatus(event.id, 'en_attente')}>
                            <EyeOff className="h-3.5 w-3.5" aria-hidden /> Dépublier
                          </button>
                        )}
                        {event.verification_status !== 'termine' && (
                          <button type="button" className={btnGhost} disabled={busyId === event.id}
                            onClick={() => setEventStatus(event.id, undefined, 'termine')}>
                            Terminé
                          </button>
                        )}
                        {event.verification_status !== 'annule' && (
                          <button type="button" className={btnGhost} disabled={busyId === event.id}
                            onClick={() => setEventStatus(event.id, undefined, 'annule')}>
                            Annulé
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'creators' && (
        <section className="mt-6 space-y-6" aria-label="Gestion des créateurs">
          <PendingCreators creators={snapshot.pendingCreators} busyId={busyId} onPublish={(id) => setCreatorStatus(id, 'publie')} onReject={(id) => setCreatorStatus(id, 'refuse')} />
          <AllCreators creators={snapshot.creators} busyId={busyId} onPublish={(id) => setCreatorStatus(id, 'publie')} onUnpublish={(id) => setCreatorStatus(id, 'en_attente')} callAdmin={callAdmin} refresh={refresh} />
        </section>
      )}

      {tab === 'logs' && (
        <section className="mt-6" aria-label="Journal d'administration">
          {snapshot.auditLogs.length === 0 ? (
            <EmptyState title="Journal vide" hint="Les actions de modération seront journalisées ici." />
          ) : (
            <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-ash-900/80">
              {snapshot.auditLogs.map((log) => (
                <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{log.action}</p>
                    <p className="text-xs text-ash-500">
                      {log.entity_type} · {log.details ?? '—'}
                    </p>
                  </div>
                  <time className="text-xs text-ash-500">{formatDateTime(log.created_at)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'announcement' && (
        <section className="mt-6 max-w-2xl rounded-2xl border border-white/10 bg-ash-900/80 p-6 shadow-sm" aria-label="Annonce d'accueil">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide text-white">
            <Megaphone className="h-5 w-5 text-ember-400" aria-hidden /> Annonce de la page d'accueil
          </h2>
          <p className="mt-1 text-sm text-ash-400">
            Bandeau d'actualité communautaire affiché en haut de la page d'accueil. Laissez vide pour masquer.
          </p>
          <textarea
            rows={3}
            maxLength={500}
            value={announcementDraft}
            onChange={(e) => setAnnouncementDraft(e.target.value)}
            className="mt-4 w-full input-dark"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={saveAnnouncement}
              disabled={busyId === 'announcement'}
              className="inline-flex items-center gap-2 btn-fire px-4 py-2 text-sm"
            >
              {busyId === 'announcement' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Enregistrer
            </button>
            {announcementSaved && (
              <span className="text-sm font-medium text-emerald-400" role="status">
                Annonce enregistrée.
              </span>
            )}
          </div>
        </section>
      )}
    </Page>
  );
}

function PendingCreators({
  creators,
  busyId,
  onPublish,
  onReject,
}: {
  creators: Creator[];
  busyId: string | null;
  onPublish: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide text-white">
        Fiches de créateur en attente
        {creators.length > 0 && (
          <span className="rounded-full bg-ember-500/20 px-2 py-0.5 text-xs font-bold text-ember-300">
            {creators.length}
          </span>
        )}
      </h2>
      {creators.length === 0 ? (
        <EmptyState title="Aucune fiche en attente" hint="Les nouvelles fiches de créateur apparaîtront ici." />
      ) : (
        <ul className="space-y-3">
          {creators.map((creator) => (
            <li key={creator.id} className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white">{creator.name}</h3>
                  {(creator.categories ?? []).length > 0 && (
                    <p className="text-xs text-ash-400">{(creator.categories ?? []).join(' · ')}</p>
                  )}
                  {creator.bio && <p className="mt-1 max-w-xl text-sm text-ash-300">{creator.bio}</p>}
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={busyId === creator.id} onClick={() => onPublish(creator.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/90 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-emerald-500 disabled:opacity-60">
                    {busyId === creator.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
                    Vérifier et publier
                  </button>
                  <button type="button" disabled={busyId === creator.id} onClick={() => onReject(creator.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60">
                    <XCircle className="h-3.5 w-3.5" aria-hidden /> Refuser
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AllCreators({
  creators,
  busyId,
  onPublish,
  onUnpublish,
  callAdmin,
  refresh,
}: {
  creators: AdminSnapshot['creators'];
  busyId: string | null;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  callAdmin: (action: string, extra?: Record<string, unknown>) => Promise<unknown>;
  refresh: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-white">Tous les créateurs</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-ash-200 transition hover:bg-white/10"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden /> Ajouter un créateur
        </button>
      </div>
      {showForm && (
        <CreatorForm
          callAdmin={callAdmin}
          onDone={async () => {
            setShowForm(false);
            await refresh();
          }}
        />
      )}
      {creators.length === 0 ? (
        <EmptyState title="Aucun créateur enregistré" />
      ) : (
        <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-ash-900/80">
          {creators.map((creator) => (
            <li key={creator.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div>
                <p className="font-semibold text-white">{creator.name}</p>
                <p className="text-xs text-ash-500">/createurs/{creator.slug} · maj {formatDateTime(creator.updated_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <PublicationBadge status={creator.publication_status} />
                {creator.publication_status !== 'publie' ? (
                  <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-emerald-500 disabled:opacity-60" disabled={busyId === creator.id} onClick={() => onPublish(creator.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Publier
                  </button>
                ) : (
                  <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-ash-200 transition hover:bg-white/10 disabled:opacity-60" disabled={busyId === creator.id} onClick={() => onUnpublish(creator.id)}>
                    <EyeOff className="h-3.5 w-3.5" aria-hidden /> Dépublier
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CreatorForm({
  callAdmin,
  onDone,
}: {
  callAdmin: (action: string, extra?: Record<string, unknown>) => Promise<unknown>;
  onDone: () => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [categories, setCategories] = useState('');
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await callAdmin('create_creator', {
        name,
        bio,
        categories: categories.split(',').map((c) => c.trim()).filter(Boolean),
        links: url.trim() ? [{ label: 'Chaîne', url: url.trim() }] : [],
      });
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-5 space-y-3 rounded-xl border border-white/10 bg-ash-900/80 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="creator-name" className="mb-1 block text-xs font-medium text-ash-300">Pseudonyme *</label>
          <input id="creator-name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)}
            className="w-full input-dark" />
        </div>
        <div>
          <label htmlFor="creator-categories" className="mb-1 block text-xs font-medium text-ash-300">Catégories (séparées par des virgules)</label>
          <input id="creator-categories" maxLength={200} placeholder="Streaming, Conseils" value={categories} onChange={(e) => setCategories(e.target.value)}
            className="w-full input-dark" />
        </div>
      </div>
      <div>
        <label htmlFor="creator-bio" className="mb-1 block text-xs font-medium text-ash-300">Présentation</label>
        <textarea id="creator-bio" rows={2} maxLength={600} value={bio} onChange={(e) => setBio(e.target.value)}
          className="w-full input-dark" />
      </div>
      <div>
        <label htmlFor="creator-url" className="mb-1 block text-xs font-medium text-ash-300">Lien de chaîne</label>
        <input id="creator-url" type="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)}
          className="w-full input-dark" />
      </div>
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{error}</p>}
      <button type="submit" disabled={saving || !name}
        className="inline-flex items-center gap-2 btn-fire px-4 py-2 text-sm">
        {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Créer la fiche (en attente)
      </button>
    </form>
  );
}

function PendingEventCard({
  event,
  busy,
  onApprove,
  onReject,
}: {
  event: EventRow;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white">{event.title}</h3>
          <p className="text-sm text-ash-400">
            {event.organizer_name} · {formatDateTime(event.starts_at)}
            {event.region ? ` · ${event.region}` : ''} · {event.game_mode}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onApprove} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/90 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-emerald-500 disabled:opacity-60">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
            Vérifier et publier
          </button>
          <button type="button" onClick={onReject} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60">
            <XCircle className="h-3.5 w-3.5" aria-hidden /> Refuser
          </button>
        </div>
      </div>
      {event.description && <p className="mt-2 text-sm text-ash-300">{event.description}</p>}
      <dl className="mt-3 grid gap-1 text-xs text-ash-400 sm:grid-cols-2">
        {event.registration_url && (
          <div>
            <dt className="inline font-semibold">Inscription : </dt>
            <dd className="inline break-all">
              <a href={event.registration_url} target="_blank" rel="noopener noreferrer nofollow" className="text-ember-400 hover:text-ember-300 hover:underline">
                {event.registration_url}
              </a>
            </dd>
          </div>
        )}
        {event.source_url && (
          <div>
            <dt className="inline font-semibold">Source : </dt>
            <dd className="inline break-all">
              <a href={event.source_url} target="_blank" rel="noopener noreferrer nofollow" className="text-ember-400 hover:text-ember-300 hover:underline">
                {event.source_url}
              </a>
            </dd>
          </div>
        )}
        {event.contact_email && (
          <div>
            <dt className="inline font-semibold">Contact : </dt>
            <dd className="inline">{event.contact_email}</dd>
          </div>
        )}
        {event.prizes && (
          <div>
            <dt className="inline font-semibold">Récompenses : </dt>
            <dd className="inline">{event.prizes}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}

function ReportCard({
  report,
  busy,
  onResolve,
}: {
  report: ReportRow;
  busy: boolean;
  onResolve: (status: string, notes?: string) => void;
}) {
  const [notes, setNotes] = useState(report.moderator_notes ?? '');
  const [showNotes, setShowNotes] = useState(false);

  return (
    <article className="rounded-xl border border-white/10 bg-ash-900/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ReportStatusBadge status={report.status} />
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-ash-300">
            {REPORT_REASON_LABELS[report.reason]}
          </span>
        </div>
        <time className="text-xs text-ash-500">{formatDateTime(report.created_at)}</time>
      </div>
      <p className="mt-2 text-sm text-white">
        <span className="font-semibold">Cible :</span> {report.content_label ?? report.content_type}
        {report.content_type === 'event' && ' (événement)'}
        {report.content_type === 'team' && ' (équipe)'}
      </p>
      {report.details && <p className="mt-1 rounded-lg bg-ash-950/60 p-3 text-sm text-ash-300">{report.details}</p>}
      {report.contact_email && (
        <p className="mt-1 text-xs text-ash-500">Contact du signaleur : {report.contact_email}</p>
      )}

      {showNotes && (
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes de modération (internes)…"
          className="mt-3 w-full input-dark"
        />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" disabled={busy} onClick={() => onResolve('resolu', notes)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-emerald-500 disabled:opacity-60">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Résolu
        </button>
        <button type="button" disabled={busy} onClick={() => onResolve('rejete', notes)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-ash-200 transition hover:bg-white/10 disabled:opacity-60">
          <XCircle className="h-3.5 w-3.5" aria-hidden /> Rejeter
        </button>
        <button type="button" disabled={busy} onClick={() => onResolve('en_examen', notes)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-ash-200 transition hover:bg-white/10 disabled:opacity-60">
          En examen
        </button>
        <button type="button" onClick={() => setShowNotes((v) => !v)} className="ml-auto text-xs font-semibold text-ash-400 hover:text-ember-300">
          {showNotes ? 'Masquer les notes' : 'Ajouter des notes'}
        </button>
      </div>
    </article>
  );
}
