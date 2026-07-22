import * as yup from 'yup';

export const passwordSchema = yup
  .string()
  .required('Please enter a password.')
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password is too long.')
  .matches(/[A-Z]/, 'Password must include at least one uppercase letter.')
  .matches(/[a-z]/, 'Password must include at least one lowercase letter.')
  .matches(/[0-9]/, 'Password must include at least one number.')
  .matches(/[^A-Za-z0-9]/, 'Password must include at least one special character.');

export const loginSchema = yup.object({
  email: yup.string().required('Email is required').email('Enter a valid email'),
  password: yup.string().required('Password is required').max(128, 'Password is too long'),
});

export const registerSchema = yup.object({
  firstName: yup.string().required('First name is required').trim().max(100, 'Max 100 characters'),
  lastName: yup.string().required('Last name is required').trim().max(100, 'Max 100 characters'),
  email: yup.string().required('Email is required').email('Enter a valid email').max(255),
  phone: yup
    .string()
    .trim()
    .default('')
    .max(20, 'Max 20 characters')
    .test('phone', 'Enter a valid phone number', (value) => !value || /^[+\d\s()-]+$/.test(value)),
  password: passwordSchema,
});

export const newsletterSchema = yup.object({
  email: yup.string().required('Email is required').email('Enter a valid email'),
});

export const profileSettingsSchema = yup.object({
  firstName: yup.string().required('First name is required').trim().max(100),
  lastName: yup.string().required('Last name is required').trim().max(100),
  email: yup.string().required('Email is required').email('Enter a valid email'),
  phone: yup
    .string()
    .trim()
    .max(20)
    .matches(/^[+\d\s()-]*$/, 'Enter a valid phone number')
    .optional()
    .default(''),
  bio: yup.string().trim().max(500, 'Bio must be under 500 characters').optional().default(''),
});

export const passwordChangeSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: yup
    .string()
    .required('Confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export const organizationSchema = yup.object({
  name: yup.string().required('Organization name is required').trim().min(2).max(255),
  slug: yup
    .string()
    .required('Slug is required')
    .trim()
    .min(2)
    .max(100)
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
});

const optionalUrl = yup
  .string()
  .trim()
  .default('')
  .test('url', 'Enter a valid URL', (value) => !value || yup.string().url().isValidSync(value));

export const socialLinksSchema = yup.object({
  facebook: optionalUrl,
  twitter: optionalUrl,
  linkedin: optionalUrl,
  instagram: optionalUrl,
});

export const quickSignupSchema = yup.object({
  fullName: yup.string().required('Full name is required').trim().min(2).max(200),
  email: yup.string().required('Email is required').email('Enter a valid email'),
  password: passwordSchema,
});

export const createTestApiSchema = yup.object({
  title: yup.string().required('Exam title is required').trim().min(3).max(255),
  duration: yup.string().required('Duration is required'),
  description: yup.string().trim().max(2000).optional().default(''),
  departmentId: yup.string().required('Department is required'),
  subjectId: yup.string().required('Subject is required'),
  topicId: yup.string().required('Topic is required'),
});

export type CreateTestApiFormValues = yup.InferType<typeof createTestApiSchema>;

export const createTestSchema = yup.object({
  title: yup.string().required('Exam title is required').trim().min(3).max(255),
  slug: yup
    .string()
    .required('Exam slug is required')
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
  category: yup.string().required('Category is required'),
  duration: yup.string().required('Duration is required'),
  description: yup.string().trim().max(2000, 'Description is too long').optional().default(''),
});

export const createTestVideoSchema = yup.object({
  videoUrl: yup.string().required('Video URL is required').url('Enter a valid URL'),
});

export const becomeTeacherSchema = yup.object({
  firstName: yup.string().required('First name is required').trim().max(100),
  lastName: yup.string().required('Last name is required').trim().max(100),
  email: yup.string().required('Email is required').email('Enter a valid email'),
  phone: yup
    .string()
    .trim()
    .max(20)
    .matches(/^[+\d\s()-]*$/, 'Enter a valid phone number')
    .optional()
    .default(''),
  agreeToPrivacy: yup
    .boolean()
    .oneOf([true], 'You must accept the privacy policy')
    .required('You must accept the privacy policy'),
});

export const searchSchema = yup.object({
  query: yup.string().trim().min(2, 'Enter at least 2 characters').max(100).required('Search is required'),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required('Please enter your email address.')
    .email('Please enter a valid email address.'),
});

export const resetPasswordSchema = yup.object({
  token: yup.string().required('Your reset link is missing or invalid. Please request a new one.'),
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your password.')
    .oneOf([yup.ref('password')], 'Passwords do not match. Please try again.'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type RegisterFormValues = yup.InferType<typeof registerSchema>;
export type NewsletterFormValues = yup.InferType<typeof newsletterSchema>;
export type ProfileSettingsFormValues = yup.InferType<typeof profileSettingsSchema>;
export type PasswordChangeFormValues = yup.InferType<typeof passwordChangeSchema>;
export type OrganizationFormValues = yup.InferType<typeof organizationSchema>;
export type SocialLinksFormValues = yup.InferType<typeof socialLinksSchema>;
export type CreateTestFormValues = yup.InferType<typeof createTestSchema>;
export type CreateTestVideoFormValues = yup.InferType<typeof createTestVideoSchema>;
export type BecomeTeacherFormValues = yup.InferType<typeof becomeTeacherSchema>;
export type QuickSignupFormValues = yup.InferType<typeof quickSignupSchema>;
export type SearchFormValues = yup.InferType<typeof searchSchema>;
export type ForgotPasswordFormValues = yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>;
