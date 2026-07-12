import Breadcrumb from '@/components/ui/Breadcrumb';
import ExamGridSection from '@/components/home/ExamGridSection';
import SubjectsSection from '@/components/home/SubjectsSection';

export default function ExamsPage() {
  return (
    <>
      <Breadcrumb title="Practice Tests" />
      <SubjectsSection />
      <ExamGridSection />
    </>
  );
}
