import { Redirect } from 'expo-router';
import React from 'react';

import {
  useCapabilities,
  useShopId,
} from '@/features/shops/hooks/useShopContext';
import { LANDING_ROUTE } from '@/features/shops/utils/capabilities';

/**
 * `/shop/[shopId]` opens the user's landing tab. Every entry point links
 * here and lets this one file decide (Today for oversight, Shift for staff).
 */
export default function ShopIndex() {
  const shopId = useShopId();
  const { landing } = useCapabilities();
  // eslint-disable-next-line security/detect-object-injection
  const route = LANDING_ROUTE[landing];
  return (
    <Redirect
      href={{ pathname: `/shop/[shopId]/${route}`, params: { shopId } }}
    />
  );
}
