import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  createJSONStorage,
  devtools,
  persist,
  StateStorage,
} from 'zustand/middleware';

import i18n from '@/i18n';

import { createAppSlice } from './slices/appSlice';
import { createSocketSlice } from './slices/socketSlice';
import { createToastSlice } from './slices/toastSlice';
import { createTranslationSlice } from './slices/translationSlice';
import { StoreState } from './types';

// Create store with proper typing
const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        //create slices here
        ...createAppSlice(...a),
        ...createTranslationSlice(...a),
        ...createToastSlice(...a),
        ...createSocketSlice(...a),
      }),
      {
        name: 'app-storage',
        storage: createJSONStorage(
          () => AsyncStorage as unknown as StateStorage,
        ),
        partialize: (state: StoreState) => ({
          //states added here will be persisted
          selectedTheme: state.selectedTheme,
          locale: state.locale,
        }),
        onRehydrateStorage: (state) => {
          if (state?.locale) {
            i18n.locale = state.locale;
          }
        },
      },
    ),
    { name: 'AppStore' },
  ),
);

export { useStore };
