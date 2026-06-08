import { Stack, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { createStyleSheet, useAppStyles } from '@/hooks';

const ExampleModal = () => {
  const router = useRouter();
  const styles = useAppStyles(stylesFunc);

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>✨</Text>
            </View>
            <Text style={styles.title}>Example Modal</Text>
            <Text style={styles.subtitle}>
              This is a beautifully designed modal with modern UI patterns
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎨</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Modern Design</Text>
                <Text style={styles.featureDescription}>
                  Clean, modern interface with beautiful typography and spacing
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌙</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Dark Mode</Text>
                <Text style={styles.featureDescription}>
                  Automatic theme switching with smooth color transitions
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Performance</Text>
                <Text style={styles.featureDescription}>
                  Optimized for smooth animations and responsive interactions
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}>
              <Text style={styles.closeButtonText}>Close Modal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const stylesFunc = createStyleSheet((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background.default,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background.active,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text.primary,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  closeButton: {
    backgroundColor: colors.background.info,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
}));

export default ExampleModal;
