export interface FlattenedConfigEntry {
  path: string
  value: string
  valueType: 'string' | 'number' | 'boolean' | 'null' | 'undefined'
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const formatPrimitive = (value: unknown): FlattenedConfigEntry['value'] => {
  if (typeof value === 'string') return value
  if (typeof value === 'number')
    return Number.isFinite(value) ? `${value}` : 'NaN'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  return JSON.stringify(value)
}

const detectType = (value: unknown): FlattenedConfigEntry['valueType'] => {
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (value === null) return 'null'
  return 'undefined'
}

export const flattenConfig = (
  value: unknown,
  prefix = '',
): FlattenedConfigEntry[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      flattenConfig(item, `${prefix}[${index}]`),
    )
  }

  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, nestedValue]) =>
      flattenConfig(nestedValue, prefix ? `${prefix}.${key}` : key),
    )
  }

  const path = prefix || 'value'

  return [
    {
      path,
      value: formatPrimitive(value),
      valueType: detectType(value),
    },
  ]
}

export const createConfigSignature = (value: unknown): string =>
  flattenConfig(value)
    .map((entry) => `${entry.path}=${entry.value}`)
    .sort((a, b) => (a > b ? 1 : -1))
    .join('|')
