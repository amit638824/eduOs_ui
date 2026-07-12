export interface FooterPost {
  image: string;
  date: string;
  title: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  icon: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  badge?: string;
}

export interface CounterStat {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}

export interface SubjectCard {
  title: string;
  description: string;
  icon: string;
  href: string;
}

export interface ExamCard {
  id: string;
  title: string;
  category: string;
  filterClass: string;
  badge: string;
  badgeColor?: string;
  lessons: number;
  duration: string;
  price: string;
  originalPrice?: string;
  instructor: string;
  instructorImg: string;
  rating: number;
  reviews: number;
  image: string;
}

export interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  icon: string;
  features: { text: string; included: boolean }[];
  highlighted?: boolean;
  cta: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  image: string;
}

export interface BlogPost {
  title: string;
  date: string;
  month: string;
  image: string;
  author?: string;
  excerpt?: string;
  featured?: boolean;
}

export interface SiteContent {
  brand: {
    name: string;
    tagline: string;
    logo: string;
    logoFooter: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  social: { platform: string; icon: string; href: string }[];
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  about: {
    badge: string;
    title: string;
    highlight: string;
    description: string;
    experienceYears: number;
    features: string[];
  };
  counters: CounterStat[];
  subjects: {
    badge: string;
    title: string;
    description: string;
    secondaryDescription: string;
    items: SubjectCard[];
  };
  exams: {
    badge: string;
    title: string;
    filters: { label: string; filter: string }[];
    items: ExamCard[];
  };
  register: {
    badge: string;
    title: string;
    highlight: string;
    count: string;
    videoText: string;
    formTitle: string;
  };
  pricing: {
    badge: string;
    title: string;
    plans: PricingPlan[];
  };
  testimonials: {
    badge: string;
    title: string;
    description: string;
    items: Testimonial[];
  };
  blog: {
    badge: string;
    title: string;
    posts: BlogPost[];
  };
  footer: {
    newsletter: {
      title: string;
      titleHighlight: string;
      description: string;
      placeholder: string;
      buttonText: string;
    };
    about: string;
    hours: { title: string; weekdays: string; weekend: string };
    usefulLinks: { label: string; href: string }[];
    examLinks: { label: string; href: string }[];
    recentPosts: FooterPost[];
    copyright: { year: string; brand: string };
    social: SocialLink[];
  };
}
