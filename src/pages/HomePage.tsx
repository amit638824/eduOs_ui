import HeroSection from '@/components/home/HeroSection';
import BrandSection from '@/components/home/BrandSection';
import AboutSection from '@/components/home/AboutSection';
import CounterSection from '@/components/home/CounterSection';
import SubjectsSection from '@/components/home/SubjectsSection';
import ExamGridSection from '@/components/home/ExamGridSection';
import RegisterSection from '@/components/home/RegisterSection';
import PricingSection from '@/components/home/PricingSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BlogSection from '@/components/home/BlogSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandSection />
      <AboutSection />
      <CounterSection />
      <SubjectsSection />
      <ExamGridSection />
      <RegisterSection />
      <PricingSection />
      <TestimonialsSection />
      <BlogSection />
    </>
  );
}
