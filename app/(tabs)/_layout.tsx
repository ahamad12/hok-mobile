import { Tabs } from 'expo-router';
import React from 'react';
import { verticalScale } from 'react-native-size-matters';

import { useColors } from '../../src/contexts/ColorContext';

const TabsLayout = () => {
  const { colors } = useColors();

  return (
    <Tabs
      screenOptions={{
        tabBarLabelStyle: {
          marginTop: verticalScale(4),
        },
        tabBarStyle: {
          backgroundColor: colors.background.default,
          height: verticalScale(70),
          paddingBottom: verticalScale(20),
        },
        tabBarItemStyle: { paddingVertical: verticalScale(10) },
        tabBarActiveTintColor: colors.icon.secondary,
        tabBarInactiveTintColor: colors.icon.disabled,
      }}></Tabs>
  );
};

export default TabsLayout;
