import { getAppUrl } from '@/lib/app-url'

export function buildTelegramWebviewUrl(path: string, token: string) {
  const baseUrl = getAppUrl().replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const separator = normalizedPath.includes('?') ? '&' : '?'
  return `${baseUrl}${normalizedPath}${separator}tg_token=${encodeURIComponent(token)}`
}

export function buildTelegramFreelancerGigDetailUrl(gigId: string, token: string) {
  return buildTelegramWebviewUrl(`/telegram/freelancer/gigs/${gigId}`, token)
}

export function buildTelegramFreelancerGigApplyUrl(gigId: string, token: string) {
  return buildTelegramWebviewUrl(`/telegram/freelancer/gigs/${gigId}/apply`, token)
}
