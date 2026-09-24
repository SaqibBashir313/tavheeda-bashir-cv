import { CredentialsSection } from '@/features/home/components/CredentialsSection';
import { ExpertiseSection } from '@/features/home/components/ExpertiseSection';
import { HeroSection } from '@/features/home/components/HeroSection';
import { HighlightsStrip } from '@/features/home/components/HighlightsStrip';
import { SummarySection } from '@/features/home/components/SummarySection';

/**
 * Pages compose sections and nothing else — no data fetching, no layout
 * primitives, no animation code.
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HighlightsStrip />
      <SummarySection />
      <ExpertiseSection />
      <CredentialsSection />
    </>
  );
}
