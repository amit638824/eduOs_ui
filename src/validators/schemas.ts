import * as yup from 'yup';
import { parsePositiveIntInput } from '@/utils/positiveIntInput';

const durationMinutesField = yup
  .string()
  .required('Duration is required')
  .test('min-duration', 'Duration must be at least 1 minute', (value) => {
    const parsed = parsePositiveIntInput(value ?? '');
    return parsed != null && parsed >= 1;
  });

export function validateName(value: string | undefined | null, label: string = 'Name'): string | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return `${label} is required.`;
  if (/^[0-9]/.test(trimmed)) return `${label} cannot start with a number.`;
  if (!/^[A-Za-z]/.test(trimmed)) return `${label} must start with a letter.`;
  if (trimmed.length < 2) return `${label} must be at least 2 characters.`;
  if (trimmed.length > 50) return `${label} cannot exceed 50 characters.`;
  if (!/^[A-Za-z][A-Za-z\s'-]*$/.test(trimmed)) {
    return `${label} can only contain letters, spaces, hyphens, and apostrophes.`;
  }
  return null;
}

export function validatePassword(password: string | undefined | null): string | null {
  const p = password ?? '';
  if (!p) return 'Password is required.';
  if (p.length < 8) return 'Password must be at least 8 characters.';
  if (p.length > 128) return 'Password cannot exceed 128 characters.';
  if (!/[A-Z]/.test(p)) return 'Password must include at least one uppercase letter.';
  if (!/[a-z]/.test(p)) return 'Password must include at least one lowercase letter.';
  if (!/[0-9]/.test(p)) return 'Password must include at least one number.';
  if (!/[^A-Za-z0-9]/.test(p)) return 'Password must include at least one special character.';
  return null;
}

export const createNameSchema = (label: string = 'Name') =>
  yup
    .string()
    .trim()
    .required(`${label} is required.`)
    .test(
      'not-start-with-number',
      `${label} cannot start with a number.`,
      (value) => !value || !/^[0-9]/.test(value.trim())
    )
    .test(
      'start-with-letter',
      `${label} must start with a letter.`,
      (value) => !value || /^[A-Za-z]/.test(value.trim())
    )
    .min(2, `${label} must be at least 2 characters.`)
    .max(50, `${label} cannot exceed 50 characters.`)
    .matches(
      /^[A-Za-z][A-Za-z\s'-]*$/,
      `${label} can only contain letters, spaces, hyphens, and apostrophes.`
    );

export const firstNameSchema = createNameSchema('First name');
export const lastNameSchema = createNameSchema('Last name');

export const optionalNameSchema = (label: string = 'Name') =>
  yup
    .string()
    .trim()
    .transform((v) => (v == null || v === '' ? undefined : v))
    .optional()
    .test(
      'not-start-with-number',
      `${label} cannot start with a number.`,
      (value) => !value || !/^[0-9]/.test(value.trim())
    )
    .test(
      'start-with-letter',
      `${label} must start with a letter.`,
      (value) => !value || /^[A-Za-z]/.test(value.trim())
    )
    .min(2, `${label} must be at least 2 characters.`)
    .max(50, `${label} cannot exceed 50 characters.`)
    .matches(
      /^[A-Za-z][A-Za-z\s'-]*$/,
      `${label} can only contain letters, spaces, hyphens, and apostrophes.`
    );

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
  loginId: yup
    .string()
    .required('Email or enrollment number is required')
    .trim()
    .max(255, 'Max 255 characters')
    .test('email-or-enrollment', 'Enter a valid email or enrollment number', (value) => {
      if (!value?.trim()) return false;
      const trimmed = value.trim();
      if (trimmed.includes('@')) {
        return yup.string().email().isValidSync(trimmed);
      }
      return trimmed.length >= 2;
    }),
  password: yup.string().required('Password is required').max(128, 'Password is too long'),
});

export const registerSchema = yup.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
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
  lastName: yup.string().trim().max(100).optional().default(''),
  email: yup.string().required('Email is required').email('Enter a valid email'),
  phone: yup
    .string()
    .trim()
    .test('phone-10-digits', 'Enter a valid 10-digit number.', (value) => {
      if (!value || value.trim() === '') return true;
      const cleaned = value.replace(/[\s-]/g, '');
      return /^\d{10}$/.test(cleaned);
    })
    .optional()
    .default(''),
  bio: yup.string().trim().max(500, 'Bio must be under 500 characters').optional().default(''),
});

export const passwordChangeSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: passwordSchema.notOneOf(
    [yup.ref('currentPassword')],
    'This password has already been used. Please use another password.'
  ),
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
  duration: durationMinutesField,
  description: yup.string().trim().max(2000).optional().default(''),
  departmentId: yup.string().required('Department is required'),
  subjectId: yup.string().required('Subject is required'),
  topicId: yup.string().required('Topic is required'),
  passingMarks: yup
    .string()
    .required('Passing marks is required')
    .test('pm', 'Passing marks must be 0 or more', (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0;
    }),
    examType: yup
    .mixed<'official' | 'practice'>()
    .oneOf(['official', 'practice'])
    .default('official'),
  certificationEnabled: yup.boolean().default(true),
  instructions: yup.string().trim().max(10000).optional().default(''),
  shuffleQuestions: yup.boolean().default(false),
  shuffleOptions: yup.boolean().default(false),
  negativeMarking: yup.boolean().default(false),
  fullScreen: yup.boolean().default(true),
  allowResume: yup.boolean().default(true),
  releaseAnswers: yup.boolean().default(false),
  maxTabSwitches: yup
    .string()
    .required('Tab switch limit is required')
    .test('tabs', 'Must be 0 or more', (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 0;
    }),
  maxAttempts: yup
    .string()
    .required('Max attempts is required')
    .test('ma', 'Must be at least 1', (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1;
    }),
  scoringPolicy: yup.mixed<'latest' | 'highest'>().oneOf(['latest', 'highest']).default('latest'),
  maxFullscreenExits: yup
    .string()
    .required()
    .test('fe', 'Must be 0 or more', (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 0;
    }),
  maxCopyPasteAttempts: yup
    .string()
    .required()
    .test('cp', 'Must be 0 or more', (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 0;
    }),
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
  duration: durationMinutesField,
  description: yup.string().trim().max(2000, 'Description is too long').optional().default(''),
});

export const createTestVideoSchema = yup.object({
  videoUrl: yup.string().required('Video URL is required').url('Enter a valid URL'),
});

export const becomeTeacherSchema = yup.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
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
