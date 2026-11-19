import HeroSection from '@/components/home/HeroSection';
import JourneySection from '@/components/home/JourneySection';
import AboutSection from '@/components/home/AboutSection';
import PartnersSection from '@/components/home/PartnersSection';
import InstructorsSection from '@/components/home/InstructorsSection';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BlogSection from '@/components/home/BlogSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <JourneySection />
      <AboutSection />
      <PartnersSection />
      <InstructorsSection />
      <WhyChooseSection />
      <TestimonialsSection />
      <BlogSection />
    </>
  );
}
