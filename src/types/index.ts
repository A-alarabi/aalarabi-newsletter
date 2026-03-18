export type NewsletterStatus = 'draft' | 'published'

export interface Newsletter {
  id: number
  title: string
  slug: string
  description: string
  content: string
  coverImage: string | null
  status: NewsletterStatus
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface NewsletterListItem {
  id: number
  title: string
  slug: string
  description: string
  coverImage: string | null
  status: NewsletterStatus
  publishedAt: Date | null
  createdAt: Date
}

export interface Subscriber {
  id: number
  firstName: string
  email: string
  createdAt: Date
}

export interface AdminUser {
  id: number
  email: string
  createdAt: Date
}

export interface ApiResponse<T = null> {
  data?: T
  error?: string
  message?: string
}
