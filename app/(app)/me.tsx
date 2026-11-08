import React from 'react';

import {
  AccountCard,
  AccountSections,
} from '@/features/auth/components/AccountSections';
import { FormScreen } from '@/features/shops/components/FormScreen';

/**
 * Account, pushed from the avatar inside a shop (staff have no tenant
 * Account tab). Same sections as the tenant Account tab.
 */
export default function MeScreen() {
  return (
    <FormScreen title='Account'>
      <AccountCard />
      <AccountSections />
    </FormScreen>
  );
}
