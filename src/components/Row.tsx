import React, { useMemo } from 'react';

import { AppView, AppViewProps } from './AppView';

export interface RowProps extends AppViewProps {
  reverse?: boolean;
}

export const Row: React.FC<RowProps> = ({ reverse, style, ...props }) => {
  const rowStyle = useMemo(
    () =>
      ({
        flexDirection: reverse ? 'row-reverse' : 'row',
      }) as const,
    [reverse],
  );

  return <AppView row style={[rowStyle, style]} {...props} />;
};
