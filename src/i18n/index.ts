import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import DE from './translations/de';
import EN from './translations/en';
import FR from './translations/fr';
import SI from './translations/si';
import TA from './translations/ta';
import ZH_CN from './translations/zh-CN';

const i18n = new I18n({
  en: EN,
  si: SI,
  ta: TA,
  'zh-CN': ZH_CN,
  de: DE,
  fr: FR,
});

// initialize locale
const defaultLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
i18n.locale = defaultLocale;
i18n.enableFallback = true;

export default i18n;
export type TranslationKeys = keyof typeof EN;
