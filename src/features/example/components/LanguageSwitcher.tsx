import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { createStyleSheet, useAppStyles, useTranslation } from '@/hooks';
import {
  useLocale,
  useSetLocale,
} from '@/store/selectors/translationSelectors';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const dynamicStyles = useAppStyles(stylesFunc);
  const setLocale = useSetLocale();
  const locale = useLocale();

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageButton,
              dynamicStyles.languageButton,
              locale === language.code && dynamicStyles.languageButtonActive,
            ]}
            onPress={() => setLocale(language.code)}
            activeOpacity={0.7}>
            <Text style={styles.flag}>{language.flag}</Text>
            <Text
              style={[
                styles.languageText,
                dynamicStyles.languageText,
                locale === language.code && styles.languageTextActive,
                locale === language.code && dynamicStyles.languageTextActive,
              ]}>
              {language.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View
        style={[
          styles.currentLanguageContainer,
          dynamicStyles.currentLanguageContainer,
        ]}>
        <Text
          style={[
            styles.currentLanguageText,
            dynamicStyles.currentLanguageText,
          ]}>
          Current: {locale}
        </Text>
        <Text
          style={[styles.translationExample, dynamicStyles.translationExample]}>
          {t('PROFILE_NAME_LABEL')}
        </Text>
      </View>
    </View>
  );
};

export default LanguageSwitcher;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    padding: 20,
    borderRadius: 12,
  },
  scrollContainer: {
    paddingRight: 20,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
  },
  flag: {
    fontSize: 20,
    marginBottom: 4,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  languageTextActive: {
    fontWeight: '600',
  },
  currentLanguageContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentLanguageText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  translationExample: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

const stylesFunc = createStyleSheet((colors) => ({
  container: {
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 12,
    shadowColor: colors.border.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  languageButton: {
    backgroundColor: colors.background.default,
    borderColor: colors.border.default,
  },
  languageButtonActive: {
    backgroundColor: colors.background.active,
    borderColor: colors.border.active,
  },
  languageText: {
    color: colors.text.primary,
  },
  languageTextActive: {
    color: colors.text.primary,
  },
  currentLanguageContainer: {
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  currentLanguageText: {
    color: colors.text.primary,
  },
  translationExample: {
    color: colors.text.secondary,
  },
}));
