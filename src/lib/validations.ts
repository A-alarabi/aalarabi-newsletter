import { z } from 'zod'

export const NewsletterSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب').max(200),
  description: z.string().min(1, 'الوصف مطلوب').max(500),
  content: z.string().min(1, 'المحتوى مطلوب'),
  coverImage: z
    .string()
    .refine(
      (val) => !val || val.startsWith('/') || /^https?:\/\//.test(val),
      { message: 'رابط الصورة غير صحيح' }
    )
    .optional()
    .or(z.literal('')),
  status: z.enum(['draft', 'published']),
})

export const UpdateNewsletterSchema = NewsletterSchema.partial().extend({
  emailSubject: z.string().max(200).optional(),
  emailMessage: z.string().max(1000).optional(),
  emailCtaText: z.string().max(100).optional(),
})

export const SubscribeSchema = z.object({
  firstName: z.string().min(1, 'الاسم الأول مطلوب').max(100),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type NewsletterInput = z.infer<typeof NewsletterSchema>
export type SubscribeInput = z.infer<typeof SubscribeSchema>
export type LoginInput = z.infer<typeof LoginSchema>
