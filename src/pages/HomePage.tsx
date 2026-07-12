import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import MobileMenu from '@/components/layout/MobileMenu';
import ThemeShadow from '@/components/layout/ThemeShadow';
import Footer from '@/components/layout/Footer';
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
      <TopBar />
      <Header />
      <MobileMenu />
      <ThemeShadow />
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
      <Footer />
    </>
  );
}
