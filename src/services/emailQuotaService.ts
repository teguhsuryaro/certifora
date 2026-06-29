import { supabase } from '../lib/supabase'

export interface EmailQuota {
  dailySent: number
  dailyLimit: number
  monthlySent: number
  monthlyLimit: number
}

const DAILY_LIMIT = 100
const MONTHLY_LIMIT = 3000

export async function getEmailQuota(): Promise<EmailQuota> {
  const now = new Date()
  
  // Start of day (UTC or Local? Supabase stores in UTC usually, let's use UTC)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Query daily sent
  const { count: dailyCount, error: dailyError } = await supabase
    .from('delivery_logs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'success')
    .gte('sent_at', startOfDay)

  if (dailyError) throw dailyError

  // Query monthly sent
  const { count: monthlyCount, error: monthlyError } = await supabase
    .from('delivery_logs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'success')
    .gte('sent_at', startOfMonth)

  if (monthlyError) throw monthlyError

  return {
    dailySent: dailyCount || 0,
    dailyLimit: DAILY_LIMIT,
    monthlySent: monthlyCount || 0,
    monthlyLimit: MONTHLY_LIMIT,
  }
}
