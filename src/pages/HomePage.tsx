import HeroSection from '@/components/home/HeroSection';
import ExamStripSection from '@/components/home/ExamStripSection';
import JourneySection from '@/components/home/JourneySection';
import AboutSection from '@/components/home/AboutSection';
import CoursesSection from '@/components/home/CoursesSection';
import PartnersSection from '@/components/home/PartnersSection';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BlogSection from '@/components/home/BlogSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ExamStripSection />
      <JourneySection />
      <AboutSection />
      <CoursesSection />
      <PartnersSection />
      <WhyChooseSection />
      <TestimonialsSection />
      <BlogSection />
    </>
  );
}
