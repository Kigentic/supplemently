import ChallengePlanWizard from '@/app/_components/ChallengePlanWizard';

export const metadata = {
  title: 'Dein Longevity Challenge-Plan',
};

export default function LongevityPlanPage() {
  return <ChallengePlanWizard challengeSlug="challenge-1" challengeName="Longevity Challenge" />;
}
