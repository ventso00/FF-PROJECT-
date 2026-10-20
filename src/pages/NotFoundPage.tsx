import { Page, EmptyState } from '@/components/Common';

export default function NotFoundPage() {
  return (
    <Page>
      <div className="py-12 text-center">
        <p className="animate-flicker font-display text-7xl font-bold tracking-wide text-fire">404</p>
        <div className="mt-6">
          <EmptyState title="Page introuvable" hint="Le lien est peut-être erroné ou la page a été déplacée." />
        </div>
      </div>
    </Page>
  );
}
