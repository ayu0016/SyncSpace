import { format, isToday, isYesterday, differenceInDays, parseISO } from 'date-fns'

// "2026-04-10" → "today" / "yesterday" / "2d ago" / "Apr 10, 2026"
export const formatRelativeDate = (dateStr) => {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'today'
  if (isYesterday(date)) return 'yesterday'
  const days = differenceInDays(new Date(), date)
  if (days <= 6) return `${days}d ago`
  return format(date, 'MMM d, yyyy')
}

// "2026-04-10" → "Apr 10"
export const formatShortDate = (dateStr) => {
  return format(parseISO(dateStr), 'MMM d')
}

// "2026-04-10" → number of days since that date
export const getDaysAgo = (dateStr) => {
  return differenceInDays(new Date(), parseISO(dateStr))
}