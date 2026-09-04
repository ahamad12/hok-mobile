import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

import { useStore } from '@/store';
import { palette } from '@/theme/Colors';
import { spacing } from '@/theme/Common';

import { AppButton } from './AppButton';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { Column } from './Column';
import { ThemedView } from './ThemedView';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('AppErrorBoundary caught:', error, info);
    this.props.onError?.(error, info);

    try {
      useStore.getState().showToast({
        variant: 'error',
        title: 'Something went wrong',
        message: error.message || 'An unexpected error occurred.',
        duration: 6000,
      });
    } catch {
      // store may not be ready
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <ThemedView>
          <Column flex={1} align='center' justify='center' px={6} gap={4}>
            <ThemedView style={styles.iconWrap}>
              <AppIcon name='CircleX' size={40} color={palette.red[500]} />
            </ThemedView>
            <AppText variant='h3' weight='bold' align='center'>
              Something went wrong
            </AppText>
            <AppText variant='body' color='secondary' align='center'>
              {this.state.error?.message ||
                'We hit a snag loading this screen.'}
            </AppText>
            <AppButton
              variant='primary'
              fullWidth
              onPress={this.handleRetry}
              style={styles.retryButton}
            >
              Try again
            </AppButton>
          </Column>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  retryButton: { marginTop: spacing[2] },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: (palette.red[50] as string) ?? 'rgba(239,68,68,0.08)',
  },
});
