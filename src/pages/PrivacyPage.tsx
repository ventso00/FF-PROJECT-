import { Page } from '@/components/Common';

export default function PrivacyPage() {
  return (
    <Page>
      <div className="mx-auto max-w-3xl">
        <h1 className="animate-fade-up font-display text-4xl font-bold uppercase tracking-wide heading-glare sm:text-5xl">
          Confidentialité et <span className="text-fire">modération</span>
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ash-400 sm:text-base">
          Comment MadaFF Hub collecte, utilise et protège les données — et comment la modération fonctionne.
        </p>

        <div className="mt-8 space-y-8">
          <section aria-labelledby="data-title" className="animate-fade-up">
            <h2 id="data-title" className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
              Données collectées
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ash-300">
              <li>
                <strong>Propositions d'événements :</strong> titre, description, organisateur, dates, liens et e-mail
                de contact. L'e-mail sert uniquement au suivi de la proposition et n'est jamais affiché publiquement.
              </li>
              <li>
                <strong>Signalements :</strong> motif, détails et e-mail facultatif. Ils sont transmis uniquement à
                l'équipe de modération.
              </li>
              <li>
                <strong>Pages d'équipe :</strong> informations publiques fournies par l'équipe (nom, région,
                membres ayant consenti, liens officiels).
              </li>
            </ul>
            <p className="mt-3 rounded-lg border border-ember-500/30 bg-ember-500/10 p-4 text-sm leading-relaxed text-ember-100">
              Le site ne demande <strong>jamais</strong> le mot de passe de votre compte Free Fire. Les identifiants
              de jeu ne sont collectés que si nécessaire et avec une finalité claire.
            </p>
          </section>

          <section aria-labelledby="retention-title" className="animate-fade-up">
            <h2 id="retention-title" className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
              Conservation et vos droits
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ash-300">
              Les données de contact liées aux propositions et signalements sont conservées le temps du traitement
              puis purgées périodiquement. Vous pouvez demander la correction ou la suppression de vos données à tout
              moment via l'adresse de contact ci-dessous.
            </p>
          </section>

          <section aria-labelledby="moderation-title" className="animate-fade-up">
            <h2 id="moderation-title" className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
              Modération
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ash-300">
              <li>Toute proposition d'événement est vérifiée (source, dates, règles) avant publication.</li>
              <li>Chaque signalement reçoit un identifiant et un statut de traitement (nouveau, en examen, résolu, rejeté).</li>
              <li>Une publication peut être masquée temporairement en cas de signalement sérieux.</li>
              <li>
                Un organisateur affecté par une décision de modération peut demander un recours via l'adresse de
                contact : la décision sera réexaminée par un second modérateur.
              </li>
              <li>Les actions sensibles de modération sont journalisées, sans données sensibles inutiles.</li>
            </ul>
          </section>

          <section aria-labelledby="verification-title" className="animate-fade-up">
            <h2 id="verification-title" className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
              Signification du statut « Vérifié »
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ash-300">
              « Vérifié » signifie que les informations essentielles d'une annonce (source, dates, modalités) ont été
              contrôlées selon le processus du site. Cela ne signifie pas que Garena approuve ou sponsorise
              l'événement. MadaFF Hub est une plateforme indépendante, non affiliée à Garena.
            </p>
          </section>

          <section aria-labelledby="contact-title" className="animate-fade-up">
            <h2 id="contact-title" className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
              Contact
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ash-300">
              Pour toute demande relative à vos données, un recours de modération ou un signalement :
              <a href="mailto:contact@madaff-hub.example" className="ml-1 font-semibold text-ember-400 hover:text-ember-300">
                contact@madaff-hub.example
              </a>
            </p>
          </section>
        </div>
      </div>
    </Page>
  );
}
