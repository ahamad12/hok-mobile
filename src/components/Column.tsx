import React from 'react';

import { AppView, AppViewProps } from './AppView';

export type ColumnProps = AppViewProps;

export const Column: React.FC<ColumnProps> = ({ style, children, ...props }) => {
  return (
    <AppView style={style} {...props}>
      {children}
    </AppView>
  );
};
