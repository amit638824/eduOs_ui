export const EXAM_CATEGORY_SLUGS = [
  'sat-act',
  'ap',
  'ap-ib',
  'state',
  'certification',
  'nclex',
  'it',
] as const;

export type ExamCategorySlug = (typeof EXAM_CATEGORY_SLUGS)[number];

export function isExamCategorySlug(slug: string): slug is ExamCategorySlug {
  return EXAM_CATEGORY_SLUGS.includes(slug as ExamCategorySlug);
}

export function getExamCategoryTitle(slug: ExamCategorySlug): string {
  const titles: Record<ExamCategorySlug, string> = {
    'sat-act': 'SAT & ACT Prep',
    ap: 'AP Exams',
    'ap-ib': 'AP & IB Exams',
    state: 'State Assessments',
    certification: 'Certifications',
    nclex: 'NCLEX & Nursing',
    it: 'IT Certifications',
  };
  return titles[slug];
}
