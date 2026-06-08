import { TranslationKeys } from '@/i18n';
import {
  useLocale,
  useSetLocale,
  useTranslate as useTranslateSelector,
} from '@/store/selectors/translationSelectors';

export function useTranslation() {
  const tStore = useTranslateSelector() as (key: TranslationKeys) => string;
  const locale = useLocale();
  const setLocale = useSetLocale();

  const t = (key: TranslationKeys) => tStore(key);

  return { t, locale, setLocale };
}
