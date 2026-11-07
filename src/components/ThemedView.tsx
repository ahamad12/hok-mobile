import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { Background } from '@/theme/Colors';

export interface ThemedViewProps {
  bg?: keyof Background;
  style?: ViewStyle;
  children?: React.ReactNode;
  keyboardAware?: boolean;
  /** Set false when a full-bleed header (e.g. a gradient hero) should
   * extend under the status bar instead of sitting below a reserved
   * top inset in the screen's base background color. */
  topInset?: boolean;
  /** Force the status bar icon color instead of deriving it from the
   * app theme. Use 'light' when `topInset` is false and the content
   * behind the status bar is always a dark gradient regardless of
   * the selected app theme. */
  statusBarStyle?: 'auto' | 'light' | 'dark';
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  bg = 'default',
  style,
  children,
  keyboardAware = false,
  topInset = true,
  statusBarStyle = 'auto',
}) => {
  const theme = useTheme();

  const resolvedStatusBarStyle = () => {
    if (statusBarStyle !== 'auto') return statusBarStyle;
    return theme.colors.isDark ? 'light' : 'dark';
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background[bg],
        },
        style,
      ]}
      edges={topInset ? ['top', 'bottom'] : ['bottom']}>
      <StatusBar style={resolvedStatusBarStyle()} />
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {children}
        </KeyboardAvoidingView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
