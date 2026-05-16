import { redirect } from 'next/navigation'
import { getISOWeek } from '@/lib/utils'

export default function WeeklyPage() {
  const currentWeek = getISOWeek(new Date())
  redirect(`/weekly/${currentWeek}`)
}
