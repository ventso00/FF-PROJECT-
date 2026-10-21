import { useState, type ReactNode, type FormEvent } from 'react';
import { Flag, X, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ReportReason } from '@/lib/types';
import { REPORT_REASON_LABELS } from '@/lib/types';

interface ReportDialogProps {
  contentType: 'event' | 'team' | 'other';
  contentId?: string | null;
  contentLabel: string;
}

export function ReportButton({ contentType, contentId, contentLabel }: ReportDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-ash-300 transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300"
      >
        <Flag className="h-4 w-4" aria-hidden />
        Signaler
      </button>
      {open && (
        <ReportDialog
          contentType={contentType}
          contentId={contentId ?? null}
          contentLabel={contentLabel}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ReportDialog({ contentType, contentId, contentLabel, onClose }: ReportDialogProps & { onClose: () => void }) {
  const [reason, setReason] = useState<ReportReason>('perime');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from('reports').insert({
      content_type: contentType,
      content_id: contentId,
      content_label: contentLabel,
      reason,
      details: details.trim() || null,
      contact_email: email.trim() || null,
    });
    setSubmitting(false);
    if (insertError) {
      setError('L\'envoi du signalement a échoué. Réessayez dans un instant.');
      return;
    }
    setDone(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Signaler un contenu"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-lg animate-fade-up overflow-y-auto rounded-t-2xl border border-white/10 bg-ash-900 p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">Signaler un problème</h2>
            <p className="mt-0.5 text-sm text-ash-400">Concerne : {contentLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ash-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" aria-hidden />
            <p className="font-display text-xl font-semibold uppercase text-white">Signalement reçu</p>
            <p className="max-w-sm text-sm leading-relaxed text-ash-400">
              Merci. Un identifiant de suivi a été créé et l'équipe de modération va examiner votre signalement.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost mt-2"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="report-reason" className={labelClass}>
                Motif du signalement
              </label>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className={inputClass}
              >
                {Object.entries(REPORT_REASON_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-ash-900">
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="report-details" className={labelClass}>
                Détails <span className="font-normal text-ash-500">(facultatif)</span>
              </label>
              <textarea
                id="report-details"
                rows={3}
                maxLength={1000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Expliquez brièvement le problème constaté…"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="report-email" className={labelClass}>
                Votre e-mail <span className="font-normal text-ash-500">(facultatif, pour un suivi)</span>
              </label>
              <input
                id="report-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.mg"
                className={inputClass}
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 ring-1 ring-red-400/30" role="alert">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-ash-300 transition hover:bg-white/5 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-fire"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Envoyer le signalement
              </button>
            </div>
            <p className="text-xs leading-relaxed text-ash-500">
              Les signalements sont transmis à l'équipe de modération avec un identifiant de suivi. Aucune donnée
              n'est rendue publique.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-white/15 bg-ash-950/60 px-3 py-2 text-sm text-ash-100 placeholder-ash-500 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/30';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash-300';

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</div>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-3xl font-semibold uppercase tracking-wide heading-glare sm:text-4xl">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-12 text-center">
      <p className="font-semibold text-ash-200">{title}</p>
      {hint && <p className="mt-1 text-sm text-ash-400">{hint}</p>}
    </div>
  );
}

export function Spinner({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-ash-400">
      <Loader2 className="h-5 w-5 animate-spin text-ember-500" aria-hidden />
      <span className="text-sm font-semibold uppercase tracking-wide">{label}</span>
    </div>
  );
}
