import PageBanner from '@/components/eduleb/PageBanner';
import ExamGridSection from '@/components/home/ExamGridSection';
import SubjectsSection from '@/components/home/SubjectsSection';
import type { ExamCategorySlug } from '@/utils/routes';

interface ExamsPageProps {
  category?: ExamCategorySlug;
  title?: string;
}

export default function ExamsPage({ category, title = 'Practice Tests' }: ExamsPageProps) {
  return (
    <>
      <PageBanner
        title={title}
        crumb="Practice Tests"
        tone="exams"
        subtitle="Choose your target exam and start preparing with confidence."
      />
      <SubjectsSection />
      <ExamGridSection activeCategory={category} />
    </>
  );
}
