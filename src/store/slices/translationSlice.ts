import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { StateCreator } from 'zustand';

import i18n, { TranslationKeys } from '@/i18n';

const STORAGE_KEY = '@app_language';

export type TranslationSlice = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: TranslationKeys, options?: Record<string, unknown>) => string;
};

const loadLocale = async () => {
  try {
    const savedLocale = await AsyncStorage.getItem(STORAGE_KEY);
    return savedLocale || Localization.getLocales()[0]?.languageCode || 'en';
  } catch (error) {
    console.error('Failed to load locale', error);
    return Localization.getLocales()[0]?.languageCode || 'en';
  }
};

export const createTranslationSlice: StateCreator<
  TranslationSlice,
  [],
  [],
  TranslationSlice
> = (set, _get) => {
  // Initialize with default locale, will be updated when store is created
  let currentLocale = Localization.getLocales()[0]?.languageCode || 'en';
  i18n.locale = currentLocale;

  // Load saved locale when store initializes
  loadLocale().then((savedLocale) => {
    if (savedLocale) {
      i18n.locale = savedLocale;
      set({ locale: savedLocale });
      currentLocale = savedLocale;
    }
  });

  return {
    locale: currentLocale,

    setLocale: async (locale) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, locale);
        i18n.locale = locale;
        set({ locale });
        currentLocale = locale;
      } catch (error) {
        console.error('Failed to save locale', error);
      }
    },

    t: (key: TranslationKeys, options?: Record<string, unknown>) => {
      return i18n.t(key, options);
    },
  };
};
