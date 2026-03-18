import { getSiteSettings, getAllSocialLinks } from '@/lib/site'
import SiteSettingsForm from '@/components/admin/SiteSettingsForm'
import SocialLinksManager from '@/components/admin/SocialLinksManager'

export default async function SettingsPage() {
  const [settings, socialLinks] = await Promise.all([
    getSiteSettings(),
    getAllSocialLinks(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">الإعدادات</h1>
        <p className="mt-1 text-sm text-gray-500">إدارة هوية الموقع وروابط التواصل الاجتماعي</p>
      </div>

      <SiteSettingsForm settings={settings} />

      <SocialLinksManager initialLinks={socialLinks} />
    </div>
  )
}
