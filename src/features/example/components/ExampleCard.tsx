import { Text, TouchableOpacity, View } from 'react-native';

import { createStyleSheet, useAppStyles } from '@/hooks';

type ExampleCardProps = {
  title: string;
  description: string;
  onPress: () => void;
};

export const ExampleCard = ({
  title,
  description,
  onPress,
}: ExampleCardProps) => {
  const styles = useAppStyles(stylesFunc);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>→</Text>
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardDescription}>{description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardActionText}>Tap to explore</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const stylesFunc = createStyleSheet((colors) => ({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    color: colors.text.primary,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
}));
