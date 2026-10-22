import { CredentialsSection } from '@/features/home/components/CredentialsSection';
import { ExpertiseSection } from '@/features/home/components/ExpertiseSection';
import { FinalCtaSection } from '@/features/home/components/FinalCtaSection';
import { HeroSection } from '@/features/home/components/HeroSection';
import { HighlightsStrip } from '@/features/home/components/HighlightsStrip';
import { ProcessSection } from '@/features/home/components/ProcessSection';
import { ServicesSection } from '@/features/home/components/ServicesSection';
import { SummarySection } from '@/features/home/components/SummarySection';
import { WhyChooseUsSection } from '@/features/home/components/WhyChooseUsSection';

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
      <ServicesSection />
      <ProcessSection />
      <ExpertiseSection />
      <CredentialsSection />
      <WhyChooseUsSection />
      <FinalCtaSection />
    </>
  );
}
