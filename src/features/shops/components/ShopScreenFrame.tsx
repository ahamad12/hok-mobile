import React, { ReactNode } from 'react';

import { AppButton } from '@/components/AppButton';
import { IconName } from '@/components/AppIcon';

import { FormScreen } from './FormScreen';
import { ShopTabScreen } from './ShopTabScreen';

export type ScreenMode = 'tab' | 'pushed';

type Props = {
  mode: ScreenMode;
  title: string;
  /** The screen's one main action. */
  action?: { icon: IconName; label: string; onPress: () => void };
  children: ReactNode;
};

/**
 * One body, two homes: as a shop tab it gets the tab chrome with the action
 * in the header; pushed from Records it keeps the back bar and a bottom
 * action button.
 */
export function ShopScreenFrame({ mode, title, action, children }: Props) {
  if (mode === 'tab') {
    return (
      <ShopTabScreen title={title} actions={action ? [action] : []}>
        {children}
      </ShopTabScreen>
    );
  }
  return (
    <FormScreen
      title={title}
      footer={
        action ? (
          <AppButton
            variant='brand'
            size='lg'
            onPress={action.onPress}
            iconLeft={action.icon}
            fullWidth>
            {action.label}
          </AppButton>
        ) : undefined
      }>
      {children}
    </FormScreen>
  );
}
