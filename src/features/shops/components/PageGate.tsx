import React, { ComponentType } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { useCapabilities } from '@/features/shops/hooks/useShopContext';
import { GatedPage } from '@/features/shops/utils/capabilities';

import { FormScreen } from './FormScreen';

/**
 * Wraps a shop page so a role that can't use it sees a lock instead of a
 * half-working screen (e.g. opened from a deep link). UI only: the server
 * still rejects the calls.
 */
export function withPageAccess<P extends object>(
  page: GatedPage,
  title: string,
  Screen: ComponentType<P>,
) {
  function Gated(props: P) {
    const { pages } = useCapabilities();
    // eslint-disable-next-line security/detect-object-injection
    if (!pages[page]) {
      return (
        <FormScreen title={title}>
          <EmptyState
            icon='Lock'
            title='Not available for your role'
            body='Ask an owner or manager if you need this.'
          />
        </FormScreen>
      );
    }
    return <Screen {...props} />;
  }
  Gated.displayName = `withPageAccess(${page})`;
  return Gated;
}
