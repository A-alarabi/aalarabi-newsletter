import { getSiteSettings } from '@/lib/site'
import SubscriptionFormClient from './SubscriptionFormClient'

// Server component — fetches settings once, passes to client form.
// Import path is unchanged for all consumers.
export default async function SubscriptionForm() {
  const settings = await getSiteSettings()
  return <SubscriptionFormClient settings={settings} />
}
