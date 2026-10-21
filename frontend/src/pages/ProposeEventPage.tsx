import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { REGIONS } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { Page } from '@/components/Common';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

type FieldType = 'en_ligne' | 'presentiel';

export default function ProposeEventPage() {
  const [title, setTitle] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [description, setDescription] = useState('');
  const [gameMode, setGameMode] = useState('Squad (4v4)');
  const [eventType, setEventType] = useState<FieldType>('en_ligne');
  const [region, setRegion] = useState('Antananarivo');
  const [startsAt, setStartsAt] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [prizes, setPrizes] = useState('');
  const [rules, setRules] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (title.trim().length < 5) return 'Le titre doit contenir au moins 5 caractères.';
    if (organizerName.trim().length < 2) return 'Le nom de l\'organisateur est requis.';
    if (!startsAt) return 'La date et l\'heure de début sont requises.';
    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime())) return 'La date de début est invalide.';
    if (start.getTime() < Date.now() - 60_000) return 'La date de début doit être dans le futur.';
    if (registrationUrl.trim() && !/^https?:\/\/.+/.test(registrationUrl.trim()))
      return 'Le lien d\'inscription doit commencer par http(s)://';
    if (sourceUrl.trim() && !/^https?:\/\/.+/.test(sourceUrl.trim()))
      return 'Le lien source doit commencer par http(s)://';
    if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim()))
      return 'L\'adresse e-mail de contact est invalide.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError(null);

    const slugBase = slugify(title);
    const { error: insertError } = await supabase.from('events').insert({
      organizer_name: organizerName.trim(),
      title: title.trim(),
      slug: `${slugBase}-${Date.now().toString(36).slice(-5)}`,
      description: description.trim() || null,
      game_mode: gameMode,
      event_type: eventType,
      region: eventType === 'presentiel' ? region : null,
      starts_at: new Date(startsAt).toISOString(),
      registration_deadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
      registration_url: registrationUrl.trim() || null,
      stream_url: streamUrl.trim() || null,
      prizes: prizes.trim() ? `À confirmer — ${prizes.trim()}` : null,
      rules: rules.trim() || null,
      source_url: sourceUrl.trim() || null,
      contact_email: contactEmail.trim() || null,
    });

    setSubmitting(false);
    if (insertError) {
      setError('L\'envoi a échoué. Réessayez dans un instant.');
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <Page>
      <h1 className="animate-fade-up font-display text-4xl font-bold uppercase tracking-wide heading-glare sm:text-5xl">
        Proposer un <span className="text-fire">événement</span>
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ash-400 sm:text-base">
        Organisateurs : remplissez ce formulaire pour soumettre votre tournoi ou événement communautaire. Notre
        équipe vérifie les informations (source, dates, règles) avant publication. La publication est gratuite
        pendant la phase pilote.
      </p>

      {done ? (
        <div className="mt-8 flex animate-fade-up flex-col items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400" aria-hidden />
          <p className="font-display text-3xl font-semibold uppercase tracking-wide text-white">Proposition envoyée</p>
          <p className="max-w-md text-sm leading-relaxed text-ash-300">
            Merci ! Votre événement est en file de vérification avec le statut « À vérifier ». Il sera publié dès
            que l'équipe de modération aura contrôlé les informations. Conservez l'adresse e-mail de contact pour
            être informé de la décision.
          </p>
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setTitle('');
              setOrganizerName('');
              setDescription('');
              setStartsAt('');
              setRegistrationDeadline('');
              setRegistrationUrl('');
              setStreamUrl('');
              setSourceUrl('');
              setPrizes('');
              setRules('');
              setContactEmail('');
            }}
            className="btn-ghost mt-2"
          >
            Proposer un autre événement
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-6" noValidate>
          <fieldset className="animate-fade-up rounded-2xl border border-white/10 bg-ash-900/80 p-5 shadow-lg shadow-black/20">
            <legend className="px-1 font-display text-xl font-semibold uppercase tracking-wide text-ember-400">Informations principales</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="ev-title" className="label-dark">
                  Titre de l'événement *
                </label>
                <input
                  id="ev-title"
                  type="text"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Tournoi Squad Battle Toamasina #3"
                  className="input-dark"
                />
              </div>
              <div>
                <label htmlFor="ev-organizer" className="label-dark">
                  Nom de l'organisateur *
                </label>
                <input
                  id="ev-organizer"
                  type="text"
                  required
                  maxLength={80}
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="Ex. FF Community Mada"
                  className="input-dark"
                />
              </div>
              <div>
                <label htmlFor="ev-mode" className="label-dark">
                  Mode de jeu *
                </label>
                <select id="ev-mode" value={gameMode} onChange={(e) => setGameMode(e.target.value)} className="input-dark">
                  <option className="bg-ash-900">Squad (4v4)</option>
                  <option className="bg-ash-900">Duo (2v2)</option>
                  <option className="bg-ash-900">Solo</option>
                  <option className="bg-ash-900">Clash Squad</option>
                  <option className="bg-ash-900">Battle Royale</option>
                  <option className="bg-ash-900">Autre</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ev-desc" className="label-dark">
                  Description
                </label>
                <textarea
                  id="ev-desc"
                  rows={3}
                  maxLength={1500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Format, nombre de places, public visé…"
                  className="input-dark"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="animate-fade-up rounded-2xl border border-white/10 bg-ash-900/80 p-5 shadow-lg shadow-black/20">
            <legend className="px-1 font-display text-xl font-semibold uppercase tracking-wide text-ember-400">Date et format</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ev-type" className="label-dark">
                  Type d'événement *
                </label>
                <select
                  id="ev-type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as FieldType)}
                  className="input-dark"
                >
                  <option value="en_ligne" className="bg-ash-900">En ligne</option>
                  <option value="presentiel" className="bg-ash-900">Présentiel</option>
                </select>
              </div>
              {eventType === 'presentiel' && (
                <div>
                  <label htmlFor="ev-region" className="label-dark">
                    Ville / région *
                  </label>
                  <select id="ev-region" value={region} onChange={(e) => setRegion(e.target.value)} className="input-dark">
                    {REGIONS.map((r) => (
                      <option key={r} value={r} className="bg-ash-900">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="ev-start" className="label-dark">
                  Date et heure de début *
                </label>
                <input
                  id="ev-start"
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="input-dark"
                />
              </div>
              <div>
                <label htmlFor="ev-deadline" className="label-dark">
                  Clôture des inscriptions
                </label>
                <input
                  id="ev-deadline"
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="input-dark"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="animate-fade-up rounded-2xl border border-white/10 bg-ash-900/80 p-5 shadow-lg shadow-black/20">
            <legend className="px-1 font-display text-xl font-semibold uppercase tracking-wide text-ember-400">Inscriptions et diffusion</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ev-regurl" className="label-dark">
                  Lien d'inscription externe
                </label>
                <input
                  id="ev-regurl"
                  type="url"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  placeholder="https://…"
                  className="input-dark"
                />
              </div>
              <div>
                <label htmlFor="ev-stream" className="label-dark">
                  Lien de diffusion (stream)
                </label>
                <input
                  id="ev-stream"
                  type="url"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://…"
                  className="input-dark"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ev-source" className="label-dark">
                  Lien de l'annonce originale
                </label>
                <input
                  id="ev-source"
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://… (page Facebook, groupe, etc.)"
                  className="input-dark"
                />
                <p className="mt-1 text-xs text-ash-500">
                  Une source vérifiable accélère la validation de votre événement.
                </p>
              </div>
            </div>
          </fieldset>

          <fieldset className="animate-fade-up rounded-2xl border border-white/10 bg-ash-900/80 p-5 shadow-lg shadow-black/20">
            <legend className="px-1 font-display text-xl font-semibold uppercase tracking-wide text-ember-400">Récompenses, règles et contact</legend>
            <div className="grid gap-4">
              <div>
                <label htmlFor="ev-prizes" className="label-dark">
                  Récompenses (si confirmées)
                </label>
                <input
                  id="ev-prizes"
                  type="text"
                  maxLength={300}
                  value={prizes}
                  onChange={(e) => setPrizes(e.target.value)}
                  placeholder="Ex. 100 000 Ar pour l'équipe gagnante"
                  className="input-dark"
                />
                <p className="mt-1 text-xs text-ash-500">
                  Affiché comme « à confirmer » jusqu'à vérification par la modération.
                </p>
              </div>
              <div>
                <label htmlFor="ev-rules" className="label-dark">
                  Règles et conditions de participation
                </label>
                <textarea
                  id="ev-rules"
                  rows={4}
                  maxLength={2000}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="Frais, critères d'éligibilité, conduite attendue…"
                  className="input-dark"
                />
              </div>
              <div>
                <label htmlFor="ev-email" className="label-dark">
                  E-mail de contact (pour le suivi de votre proposition) *
                </label>
                <input
                  id="ev-email"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="vous@exemple.mg"
                  className="input-dark"
                />
                <p className="mt-1 text-xs text-ash-500">
                  Servira uniquement au suivi de votre proposition. Il n'est jamais affiché publiquement.
                </p>
              </div>
            </div>
          </fieldset>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 ring-1 ring-red-400/30" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-fire px-8 py-3 text-base"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Send className="h-5 w-5" aria-hidden />}
              Envoyer la proposition
            </button>
          </div>
        </form>
      )}
    </Page>
  );
}
