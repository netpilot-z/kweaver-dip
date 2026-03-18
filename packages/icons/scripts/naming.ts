export function toComponentName(iconId: string, suffix: string): string {
  const segments = iconId
    .replace(/^icon-/, '')
    .split('-')
    .filter(Boolean)

  const name = segments
    .map((segment) => {
      if (/^\d+$/.test(segment)) {
        return segment
      }

      return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
    })
    .join('')

  return `${name}${suffix}`
}
