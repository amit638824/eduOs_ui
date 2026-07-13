export interface DashboardCourseItem {
  title: string;
  img: string;
  badge: string;
  badgeClass?: string;
  lessons: string;
  duration: string;
  price: string;
  originalPrice?: string;
  free?: boolean;
  instructor: string;
  instructorImg: string;
  rating: number;
  reviews: number;
  showHeart?: boolean;
}

export const dashboardCourses: DashboardCourseItem[] = [
  {
    title: 'PC Hardware & Networking — Mock Test',
    img: '/img/grid/grid_1.png',
    badge: 'Certificate',
    badgeClass: 'blue__color',
    lessons: '50 Questions',
    duration: '60 min',
    price: '₹0.00',
    originalPrice: '/₹199.00',
    free: true,
    instructor: 'SCA Faculty',
    instructorImg: '/img/grid/grid_small_2.jpg',
    rating: 5,
    reviews: 428,
    showHeart: true,
  },
  {
    title: 'CCC Online Practice Exam',
    img: '/img/grid/grid_4.png',
    badge: 'CCC',
    badgeClass: 'green__color',
    lessons: '100 Questions',
    duration: '90 min',
    price: '₹0.00',
    instructor: 'SCA Faculty',
    instructorImg: '/img/grid/grid_small_3.jpg',
    rating: 5,
    reviews: 567,
    showHeart: true,
  },
  {
    title: 'Network Administration — Diploma Test',
    img: '/img/grid/grid_3.png',
    badge: 'Diploma',
    badgeClass: 'pink__color',
    lessons: '60 Questions',
    duration: '90 min',
    price: '₹49.00',
    originalPrice: '/₹149.00',
    instructor: 'SCA Faculty',
    instructorImg: '/img/grid/grid_small_1.jpg',
    rating: 5,
    reviews: 189,
    showHeart: true,
  },
];

export const messageContacts = [
  { name: 'SCA Admin', preview: 'Your online test result is ready.', time: '12 min', img: '/img/teacher/teacher__1.png' },
  { name: 'Super Computer Academy', preview: 'Welcome to the online exam portal!', time: '4:35pm', img: '/img/teacher/teacher__2.png' },
  { name: 'Faculty — Networking', preview: 'New CCC mock test uploaded.', time: '1:40pm', img: '/img/teacher/teacher__3.png' },
];

export const profileFields = [
  { label: 'Registration Date', value: 'January 20, 2026 9:00 AM' },
  { label: 'First Name', value: 'Arjun' },
  { label: 'Last Name', value: 'Mehta' },
  { label: 'Username', value: 'student1' },
  { label: 'Email', value: 'student1@edutech.com' },
  { label: 'Phone Number', value: '+91 98765 00011' },
  { label: 'Course', value: 'Hardware & Networking' },
  {
    label: 'Biography',
    value:
      'Student at Super Computer Academy, Kerakat. Preparing for certificate and diploma online exams with regular mock test practice.',
  },
];

export const feedbackRows = [
  { name: 'PC Hardware Mock Test', enrolled: '428', rating: 5 },
  { name: 'CCC Practice Exam', enrolled: '567', rating: 5 },
  { name: 'Computer Application Test', enrolled: '312', rating: 5 },
  { name: 'O Level M1-R5 Paper', enrolled: '234', rating: 4 },
];

export const quizAttempts = [
  { date: 'July 10, 2026', title: 'PC Hardware — Mock Test 1', student: 'Arjun Mehta', qus: 50, tm: 60, ca: 42, result: 'Pass' as const },
  { date: 'July 8, 2026', title: 'CCC Practice Paper', student: 'Isha Patel', qus: 100, tm: 90, ca: 78, result: 'Pass' as const },
  { date: 'July 5, 2026', title: 'MS Office — Online Test', student: 'Rohan Das', qus: 40, tm: 45, ca: 35, result: 'Over' as const },
];

export const assignments = [
  { title: 'PC Assembly Practical Report', course: 'Hardware & Networking', marks: 50, submitted: 12 },
  { title: 'Tally Accounting Exercise', course: 'Computer Application', marks: 30, submitted: 8 },
  { title: 'Network Topology Diagram', course: 'Diploma — Network Admin', marks: 40, submitted: 6 },
];

export const reviewsReceived = [
  { student: 'Arjun Mehta', date: 'July 1, 2026', course: 'CCC Mock Test', rating: 5, text: 'Online exam bahut helpful hai!' },
  { student: 'Priya Singh', date: 'June 28, 2026', course: 'Hardware Test', rating: 5, text: 'Instant result mil gaya.' },
];

export const orderHistory = [
  { id: '#SCA1001', course: 'Student Plan — 1 Month', date: 'July 1, 2026', price: '₹199.00', status: 'Success' },
  { id: '#SCA1002', course: 'Wallet Top-up', date: 'June 20, 2026', price: '₹500.00', status: 'Success' },
];

export const announcements = [
  { title: 'Online Exam Facility — All Students', course: 'All Courses', date: 'July 10, 2026', status: 'Published' },
  { title: 'CCC Mock Test Schedule — July 2026', course: 'Govt IT', date: 'July 5, 2026', status: 'Published' },
  { title: 'Admission Open — 3, 6 & 12 Month Courses', course: 'Academy', date: 'July 1, 2026', status: 'Published' },
];
