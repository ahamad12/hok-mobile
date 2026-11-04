import { Dimensions, useWindowDimensions } from 'react-native';

export const useDeviceDimensions = () => {
  const dimensions = useWindowDimensions();

  return {
    width: dimensions.width,
    height: dimensions.height,
    screenWidth: Dimensions.get('screen').width,
    screenHeight: Dimensions.get('screen').height,
  };
};