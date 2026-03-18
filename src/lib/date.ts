import { enUS, es as esLocale, ptBR } from 'date-fns/locale'

import type { AppLanguage } from '@/types'

export function getDateFnsLocale(language: AppLanguage | string) {
  switch (language) {
    case 'pt-BR':
      return ptBR
    case 'es':
      return esLocale
    case 'en':
    default:
      return enUS
  }
}
