import Breadcrumb from '@/components/ui/Breadcrumb';
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
      <Breadcrumb title={title} />
      <SubjectsSection />
      <ExamGridSection activeCategory={category} />
    </>
  );
}
