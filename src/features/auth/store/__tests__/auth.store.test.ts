import { useAuthStore } from '@/features/auth/store/auth.store';

describe('auth.store cold boot (Step 7)', () => {
  it("initial status is 'restoring' — guards show loading, never a login flash", () => {
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fresh = require('@/features/auth/store/auth.store')
      .useAuthStore as typeof useAuthStore;
    expect(fresh.getState().status).toBe('restoring');
    expect(fresh.getState().user).toBeNull();
  });

  it('signIn stores the user and flips to signedIn', () => {
    useAuthStore.getState().signIn({
      id: 'u1',
      email: 'owner@example.com',
      displayName: 'Owner',
      username: null,
      role: 'OWNER',
      shopId: null,
      isSupervisor: false,
    });
    const state = useAuthStore.getState();
    expect(state.status).toBe('signedIn');
    expect(state.user?.email).toBe('owner@example.com');
  });

  it('signOut drops the user and flips to signedOut', () => {
    useAuthStore.getState().signOut();
    const state = useAuthStore.getState();
    expect(state.status).toBe('signedOut');
    expect(state.user).toBeNull();
  });
});
