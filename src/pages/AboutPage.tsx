import Breadcrumb from '@/components/ui/Breadcrumb';
import AboutSection from '@/components/home/AboutSection';
import CounterSection from '@/components/home/CounterSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export default function AboutPage() {
  return (
    <>
      <Breadcrumb title="About Us" />
      <AboutSection />
      <CounterSection />
      <TestimonialsSection />
    </>
  );
}
