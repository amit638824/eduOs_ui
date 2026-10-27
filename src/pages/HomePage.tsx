import { useEffect } from 'react';
import AOS from 'aos';
import HeroSection from '@/components/home/HeroSection';
import ExamStripSection from '@/components/home/ExamStripSection';
import JourneySection from '@/components/home/JourneySection';
import AboutSection from '@/components/home/AboutSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import CoursesSection from '@/components/home/CoursesSection';
import PartnersSection from '@/components/home/PartnersSection';
import VideoSection from '@/components/home/VideoSection';
import InstructorsSection from '@/components/home/InstructorsSection';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BlogSection from '@/components/home/BlogSection';

export default function HomePage() {
  useEffect(() => {
    const t1 = window.setTimeout(() => {
      try {
        AOS.refreshHard();
      } catch {
        AOS.refresh();
      }
    }, 80);
    const t2 = window.setTimeout(() => {
      try {
        AOS.refresh();
      } catch {
        // noop
      }
    }, 400);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <>
      <HeroSection />
      <ExamStripSection />
      <JourneySection />
      <AboutSection />
      <CategoriesSection />
      <CoursesSection />
      <PartnersSection />
      <VideoSection />
      <InstructorsSection />
      <WhyChooseSection />
      <TestimonialsSection />
      <BlogSection />
    </>
  );
}
