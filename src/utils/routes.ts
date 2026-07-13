export const EXAM_CATEGORY_SLUGS = [
  'hardware-networking',
  'computer-application',
  'diploma',
  'govt-it',
  'programming',
  'certification',
] as const;

export type ExamCategorySlug = (typeof EXAM_CATEGORY_SLUGS)[number];

export function isExamCategorySlug(slug: string): slug is ExamCategorySlug {
  return EXAM_CATEGORY_SLUGS.includes(slug as ExamCategorySlug);
}

export function getExamCategoryTitle(slug: ExamCategorySlug): string {
  const titles: Record<ExamCategorySlug, string> = {
    'hardware-networking': 'Hardware & Networking',
    'computer-application': 'Computer Application',
    diploma: 'Diploma & Certificate',
    'govt-it': 'CCC & O Level (Govt IT)',
    programming: 'Programming',
    certification: 'IT Certifications',
  };
  return titles[slug];
}
