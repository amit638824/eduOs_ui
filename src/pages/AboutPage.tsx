import JourneySection from '@/components/home/JourneySection';
import AboutSection from '@/components/home/AboutSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export default function AboutPage() {
  return (
    <>
      <div className="eduleb-about-flow">
        <JourneySection />
      </div>
      <AboutSection />
      <TestimonialsSection />
    </>
  );
}
