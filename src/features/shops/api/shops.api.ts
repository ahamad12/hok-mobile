import { ApiResponse, unwrap } from '@/constants/ApiResponse';
import { ENDPOINTS } from '@/constants/Endpoints';
import { authedClient } from '@/services/httpClient';

import {
  CreateShopInput,
  Shop,
  ShopStaffMember,
  UpdateShopInput,
} from './shops.types';

/** OWNER only — the server rejects MANAGER/STAFF with 403. */
export async function getMyShops(): Promise<Shop[]> {
  const res = await authedClient.get<ApiResponse<{ shops: Shop[] }>>(
    ENDPOINTS.SHOPS.LIST_MY,
  );
  return unwrap(res).shops;
}

/** Any role with access to that shop (STAFF: their own shop). */
export async function getShop(id: string): Promise<Shop> {
  return unwrap(
    await authedClient.get<ApiResponse<Shop>>(ENDPOINTS.SHOPS.BY_ID(id)),
  );
}

export async function createShop(input: CreateShopInput): Promise<Shop> {
  return unwrap(
    await authedClient.post<ApiResponse<Shop>>(ENDPOINTS.SHOPS.CREATE, input),
  );
}

export async function updateShop(
  id: string,
  input: UpdateShopInput,
): Promise<Shop> {
  return unwrap(
    await authedClient.put<ApiResponse<Shop>>(
      ENDPOINTS.SHOPS.UPDATE(id),
      input,
    ),
  );
}

export async function deleteShop(id: string): Promise<void> {
  await authedClient.delete(ENDPOINTS.SHOPS.DELETE(id), { data: {} });
}

/** OWNER/MANAGER only. */
export async function getShopStaff(id: string): Promise<ShopStaffMember[]> {
  const res = await authedClient.get<ApiResponse<{ staff: ShopStaffMember[] }>>(
    ENDPOINTS.SHOPS.STAFF(id),
  );
  return unwrap(res).staff;
}

export async function removeShopStaff(
  shopId: string,
  userId: string,
): Promise<void> {
  await authedClient.delete(ENDPOINTS.SHOPS.REMOVE_STAFF(shopId, userId), {
    data: {},
  });
}
