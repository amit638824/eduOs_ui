import HeroSection from '@/components/home/HeroSection';
import BrandSection from '@/components/home/BrandSection';
import SubjectsSection from '@/components/home/SubjectsSection';
import ExamGridSection from '@/components/home/ExamGridSection';
import AboutSection from '@/components/home/AboutSection';
import PricingSection from '@/components/home/PricingSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BlogSection from '@/components/home/BlogSection';

export default function HomePage() {
  return (
    <div className="ms-landing-wrapper">
      <HeroSection />
      <BrandSection />
      <SubjectsSection />
      <ExamGridSection />
      <AboutSection />
      <PricingSection />
      <TestimonialsSection />
      <BlogSection />
    </div>
  );
}
