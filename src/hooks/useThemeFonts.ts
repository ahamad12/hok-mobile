import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

import { setCustomFontsAvailable } from '@/theme/fontState';

/**
 * Loads Plus Jakarta Sans. Returns true once ready, or once loading failed
 * (we then fall back to the system font rather than blocking the app).
 */
const useThemeFonts = (): boolean => {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  setCustomFontsAvailable(loaded && !error);
  return loaded || !!error;
};

export default useThemeFonts;
