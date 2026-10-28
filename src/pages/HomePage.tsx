import { useEffect, useState } from 'react';
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
import { getHomepage } from '@/services/home.service';
import type { HomepageContent } from '@/types/homepage';

export default function HomePage() {
  const [home, setHome] = useState<HomepageContent | null>(null);

  useEffect(() => {
    let active = true;
    void getHomepage()
      .then((data) => {
        if (active) setHome(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <HeroSection content={home?.hero} />
      <ExamStripSection content={home?.exams} />
      <JourneySection content={home?.journey} />
      <AboutSection content={home?.about} />
      <CategoriesSection content={home?.categories} />
      <CoursesSection content={home?.courses} />
      <PartnersSection content={home?.partners} />
      <VideoSection content={home?.video} />
      <InstructorsSection content={home?.instructors} />
      <WhyChooseSection content={home?.why} />
      <TestimonialsSection content={home?.testimonials} />
      <BlogSection content={home?.blog} />
    </>
  );
}
