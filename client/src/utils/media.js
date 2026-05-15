import { getApiUrl } from './api'

export const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('/uploads/')) return getApiUrl(url)
  return url
}
