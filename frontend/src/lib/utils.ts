import type { VerificationStatus } from './types';

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function isEventPast(startsAt: string): boolean {
  return new Date(startsAt).getTime() < Date.now();
}

export function isRegistrationOpen(deadline: string | null, startsAt: string, verification: VerificationStatus): boolean {
  if (verification === 'termine' || verification === 'annule') return false;
  const deadlineMs = deadline ? new Date(deadline).getTime() : null;
  const startMs = new Date(startsAt).getTime();
  const now = Date.now();
  if (deadlineMs !== null) return now < deadlineMs;
  return now < startMs;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

export function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'passé';
  const days = Math.floor(diff / 86_400_000);
  if (days >= 1) return `dans ${days} jour${days > 1 ? 's' : ''}`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours >= 1) return `dans ${hours} h`;
  const minutes = Math.floor(diff / 60_000);
  return `dans ${Math.max(minutes, 1)} min`;
}
