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
    title: 'SAT Practice Test — Full Length',
    img: '/img/grid/grid_1.png',
    badge: 'SAT',
    badgeClass: 'blue__color',
    lessons: '4 Sections',
    duration: '3 hr 15 min',
    price: '$49.00',
    originalPrice: '/$89.00',
    free: true,
    instructor: 'Dr. Sarah Mitchell',
    instructorImg: '/img/grid/grid_small_2.jpg',
    rating: 5,
    reviews: 124,
    showHeart: true,
  },
  {
    title: 'AP Calculus AB Mock Exam',
    img: '/img/grid/grid_3.png',
    badge: 'AP',
    badgeClass: 'pink__color',
    lessons: '2 Sections',
    duration: '2 hr 10 min',
    price: '$39.00',
    originalPrice: '/$67.00',
    instructor: 'Michael Torres',
    instructorImg: '/img/grid/grid_small_3.jpg',
    rating: 5,
    reviews: 88,
    showHeart: true,
  },
  {
    title: 'Texas STAAR Algebra I',
    img: '/img/grid/grid_5.png',
    badge: 'STAAR',
    badgeClass: 'green__color',
    lessons: '1 Section',
    duration: '1 hr 40 min',
    price: '$29.00',
    originalPrice: '/$49.00',
    instructor: 'Julia Jones',
    instructorImg: '/img/grid/grid_small_1.jpg',
    rating: 5,
    reviews: 56,
    showHeart: true,
  },
];

export const messageContacts = [
  { name: 'Dr. Sarah Mitchell', preview: 'Your SAT practice results are ready.', time: '12 min', img: '/img/teacher/teacher__1.png' },
  { name: 'EduTest Support', preview: 'Welcome to EduTest Pro!', time: '4:35pm', img: '/img/teacher/teacher__2.png' },
  { name: 'Julia Jones', preview: 'New AP mock exam available.', time: '1:40pm', img: '/img/teacher/teacher__3.png' },
  { name: 'Michael Torres', preview: 'Proctoring session confirmed.', time: '3:20am', img: '/img/teacher/teacher__4.png' },
  { name: 'Bradshaw', preview: 'Hey, How are you?', time: '12 min', img: '/img/teacher/teacher__5.png' },
];

export const profileFields = [
  { label: 'Registration Date', value: 'January 20, 2026 9:00 PM' },
  { label: 'First Name', value: 'Alex' },
  { label: 'Last Name', value: 'Johnson' },
  { label: 'Username', value: 'alexjohnson' },
  { label: 'Email', value: 'alex@school.edu' },
  { label: 'Phone Number', value: '+1 (555) 123-4567' },
  { label: 'Expert', value: 'SAT & AP Exams' },
  {
    label: 'Biography',
    value:
      'US high school student preparing for SAT, ACT, and AP exams. Focused on math and science sections with regular practice tests on EduTest Pro.',
  },
];

export const feedbackRows = [
  { name: 'SAT Math Practice', enrolled: '1,240', rating: 5 },
  { name: 'AP Calculus AB', enrolled: '890', rating: 5 },
  { name: 'ACT Science', enrolled: '756', rating: 4 },
  { name: 'STAAR Algebra I', enrolled: '1,102', rating: 5 },
];

export const quizAttempts = [
  { date: 'March 12, 2026', title: 'SAT Math Section — Practice 1', student: 'Alex Johnson', qus: 4, tm: 8, ca: 4, result: 'Pass' as const },
  { date: 'March 10, 2026', title: 'AP Calc AB — Mock Exam 2', student: 'Alex Johnson', qus: 4, tm: 8, ca: 3, result: 'Over' as const },
  { date: 'March 5, 2026', title: 'STAAR Algebra — Attempt 1', student: 'Alex Johnson', qus: 4, tm: 8, ca: 4, result: 'Pass' as const },
  { date: 'February 28, 2026', title: 'ACT English — Practice 3', student: 'Alex Johnson', qus: 4, tm: 8, ca: 2, result: 'Cancel' as const },
];

export const assignments = [
  { title: 'Essay: US History — Civil Rights Movement', course: 'AP US History', marks: 80, submitted: 2 },
  { title: 'Lab Report: Chemistry — Acids & Bases', course: 'AP Chemistry', marks: 100, submitted: 1 },
  { title: 'Problem Set: Algebra II', course: 'SAT Math Prep', marks: 50, submitted: 3 },
  { title: 'Reading Comprehension Practice', course: 'ACT English', marks: 75, submitted: 2 },
];

export const reviewsReceived = [
  { student: 'Alex Johnson', date: 'January 30, 2026', course: 'SAT Math Practice', rating: 5, text: 'Excellent practice material!' },
  { student: 'Maria Garcia', date: 'February 15, 2026', course: 'AP Calculus AB', rating: 5, text: 'Very helpful mock exam.' },
  { student: 'James Wilson', date: 'March 1, 2026', course: 'ACT Science', rating: 4, text: 'Good questions, timed well.' },
];

export const orderHistory = [
  { id: '#5478', course: 'SAT Pro Plan', date: 'January 27, 2026', price: '$19.99', status: 'Success' },
  { id: '#4585', course: 'AP Course Pack', date: 'February 14, 2026', price: '$29.99', status: 'Processing' },
  { id: '#9656', course: 'STAAR Prep Bundle', date: 'March 3, 2026', price: '$49.99', status: 'On Hold' },
  { id: '#7821', course: 'ACT Full Practice', date: 'March 8, 2026', price: '$39.99', status: 'Canceled' },
];

export const announcements = [
  { title: 'New SAT Digital Format Update', course: 'SAT Prep', date: 'March 1, 2026', status: 'Published' },
  { title: 'Spring Break Exam Schedule', course: 'All Courses', date: 'February 20, 2026', status: 'Published' },
  { title: 'Proctoring Policy Change', course: 'AP Exams', date: 'February 10, 2026', status: 'Draft' },
];
