export interface HomeLink {
  label: string;
  href: string;
}

export interface HomepageContent {
  hero: {
    badge: string;
    titleBefore: string;
    phrases: string[];
    description: string;
    primaryCta: HomeLink;
    secondaryCta: HomeLink;
    image: string;
    trust: { label: string; value: string }[];
    score: {
      title: string;
      percent: string;
      marks: string;
      remark: string;
      bars: { label: string; pct: number }[];
    };
    tip: string;
  };
  exams: {
    eyebrow: string;
    items: { title: string; sub: string; color: string; bg: string }[];
  };
  journey: {
    title: string;
    description: string;
    steps: { cls: string; num: string; title: string; line2: string; text: string }[];
  };
  about: {
    image: string;
    title: string;
    paragraphs: string[];
    points: string[];
    cta: HomeLink;
  };
  categories: {
    title: string;
    description: string;
    items: { img: string; label: string }[];
  };
  courses: {
    title: string;
    cta: HomeLink;
    items: { img: string; tag: string; title: string; lessons: string; duration: string; price: string }[];
  };
  partners: { title: string; logos: string[] };
  video: { image: string; href: string };
  instructors: {
    title: string;
    description: string;
    items: { img: string; name: string; role: string; courses: string; students: string }[];
  };
  why: {
    title: string;
    paragraphs: string[];
    points: string[];
    cta: HomeLink;
    image: string;
    statValue: string;
    statLabel: string;
  };
  testimonials: {
    title: string;
    image: string;
    items: { avatar: string; name: string; company: string; text: string }[];
  };
  blog: {
    title: string;
    description: string;
    items: { img: string; date: string; category: string; title: string; href: string }[];
  };
}
