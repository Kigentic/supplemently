import ChallengePlanWizard from '@/app/_components/ChallengePlanWizard';

export const metadata = {
  title: 'Dein Rückenfit Challenge-Plan',
};

export default function RueckenPlanPage() {
  return <ChallengePlanWizard challengeSlug="ruecken-challenge-1" challengeName="Rückenfit-Challenge" />;
}
