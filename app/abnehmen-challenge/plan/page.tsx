import ChallengePlanWizard from '@/app/_components/ChallengePlanWizard';

export const metadata = {
  title: 'Dein Abnehmen Challenge-Plan',
};

export default function AbnehmenPlanPage() {
  return <ChallengePlanWizard challengeSlug="abnehmen-challenge-1" challengeName="Abnehmen-Challenge" />;
}
