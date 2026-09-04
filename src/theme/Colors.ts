export const palette = {
  white: {
    50: '#FFFFFF',
    100: '#FEFEFE',
    200: '#FDFDFD',
    300: '#FCFCFC',
    400: '#FAFAFA',
    500: '#F7F7F7',
    600: '#F5F5F5',
    700: '#F2F2F2',
    800: '#F0F0F0',
    900: '#EDEDED',
  },

  black: {
    50: '#F5F5F5',
    100: '#E0E0E0',
    200: '#C2C2C2',
    300: '#A3A3A3',
    400: '#858585',
    500: '#666666',
    600: '#4D4D4D',
    700: '#333333',
    750: '#262626',
    800: '#1A1A1A',
    850: '#151515',
    900: '#000000',
  },

  charcoal: {
    25: '#FCFCFC',
    50: '#F8F9FA',
    75: '#F1F3F5',
    100: '#E9ECEF',
    150: '#DEE2E6',
    200: '#CED4DA',
    250: '#ADB5BD',
    300: '#98A2AE',
    350: '#808A98',
    400: '#6C757D',
    450: '#5A636D',
    500: '#495057',
    550: '#3D444B',
    600: '#343A40',
    650: '#2D3238',
    700: '#212529',
    750: '#1C1F23',
    800: '#18191D',
    850: '#131417',
    900: '#0D0E10',
    950: '#080809',
  },

  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  yellow: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
  },

  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  pink: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },

  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },

  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  magenta: {
    50: '#FDF4FF',
    100: '#FAE8FF',
    200: '#F5D0FE',
    300: '#F0ABFC',
    400: '#E879F9',
    500: '#D946EF',
    600: '#C026D3',
    700: '#A21CAF',
    800: '#86198F',
    900: '#701A75',
  },

  transparent: 'transparent',
};

// Design Token Types
export type Brand = {
  primary: string;
  secondary: string;
  accent: string;
};

export type Text = {
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  inverse: string;
  link: string;
  linkPressed: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  subtle: string;
  white: string;
};

export type Background = {
  default: string;
  inverse: string;
  disabled: string;
  active: string;
  subtle: string;
  surface: string;
  success: string;
  successSubtle: string;
  error: string;
  errorSubtle: string;
  warning: string;
  warningSubtle: string;
  info: string;
  infoSubtle: string;
  overlay: string;
  scrim: string;
  backdrop: string;
};

export type Border = {
  default: string;
  subtle: string;
  disabled: string;
  focus: string;
  active: string;
  success: string;
  error: string;
  warning: string;
  info: string;
};

export type Button = {
  primary: {
    default: string;
    pressed: string;
    disabled: string;
  };
  secondary: {
    default: string;
    pressed: string;
    disabled: string;
    border: string;
  };
  tertiary: {
    default: string;
    pressed: string;
    disabled: string;
  };
  destructive: {
    default: string;
    pressed: string;
    disabled: string;
  };
  success: {
    default: string;
    pressed: string;
    disabled: string;
  };
  warning: {
    default: string;
    pressed: string;
    disabled: string;
  };
};

export type Icon = {
  default: string;
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  inverse: string;
  success: string;
  error: string;
  warning: string;
  info: string;
};

export type Status = {
  default: string;
  success: string;
  error: string;
  warning: string;
  info: string;
};

export type ColorPallete = {
  brand: Brand;
  text: Text;
  background: Background;
  border: Border;
  button: Button;
  icon: Icon;
  status: Status;
};

// Light Mode Colors
export const LightColors: ColorPallete = {
  brand: {
    primary: palette.charcoal[700],
    secondary: palette.charcoal[500],
    accent: palette.charcoal[400],
  },

  text: {
    primary: palette.charcoal[900],
    secondary: palette.charcoal[600],
    tertiary: palette.charcoal[500],
    disabled: palette.charcoal[400],
    inverse: palette.white[50],
    link: palette.charcoal[700],
    linkPressed: palette.charcoal[900],
    success: palette.green[700],
    error: palette.red[700],
    warning: palette.yellow[700],
    info: palette.blue[700],
    subtle: palette.charcoal[500],
    white: palette.white[50],
  },

  background: {
    default: palette.white[50],
    inverse: palette.charcoal[900],
    disabled: palette.gray[100],
    active: palette.white[50],
    subtle: palette.gray[100],
    surface: palette.white[50],
    success: palette.green[500],
    successSubtle: palette.green[50],
    error: palette.red[500],
    errorSubtle: palette.red[50],
    warning: palette.yellow[500],
    warningSubtle: palette.yellow[50],
    info: palette.blue[500],
    infoSubtle: palette.blue[50],
    overlay: 'rgba(13, 14, 16, 0.04)',
    scrim: 'rgba(13, 14, 16, 0.5)',
    backdrop: 'rgba(13, 14, 16, 0.3)',
  },

  border: {
    default: palette.charcoal[300],
    subtle: palette.charcoal[200],
    disabled: palette.charcoal[200],
    focus: palette.charcoal[700],
    active: palette.charcoal[700],
    success: palette.green[500],
    error: palette.red[500],
    warning: palette.yellow[500],
    info: palette.blue[500],
  },

  button: {
    primary: {
      default: palette.charcoal[700],
      pressed: palette.charcoal[900],
      disabled: palette.gray[300],
    },
    secondary: {
      default: palette.white[50],
      pressed: palette.gray[100],
      disabled: palette.white[50],
      border: palette.charcoal[700],
    },
    tertiary: {
      default: palette.white[50],
      pressed: palette.gray[100],
      disabled: palette.white[50],
    },
    destructive: {
      default: palette.red[600],
      pressed: palette.red[700],
      disabled: palette.gray[300],
    },
    success: {
      default: palette.green[600],
      pressed: palette.green[700],
      disabled: palette.gray[300],
    },
    warning: {
      default: palette.yellow[600],
      pressed: palette.yellow[700],
      disabled: palette.gray[300],
    },
  },

  icon: {
    default: palette.charcoal[700],
    primary: palette.charcoal[900],
    secondary: palette.charcoal[500],
    tertiary: palette.charcoal[400],
    disabled: palette.charcoal[300],
    inverse: palette.white[50],
    success: palette.green[600],
    error: palette.red[600],
    warning: palette.yellow[700],
    info: palette.blue[600],
  },

  status: {
    default: palette.blue[600],
    success: palette.green[600],
    error: palette.red[600],
    warning: palette.yellow[600],
    info: palette.blue[600],
  },
};

// Dark Mode Colors
export const DarkColors: ColorPallete = {
  brand: {
    primary: palette.charcoal[400],
    secondary: palette.charcoal[300],
    accent: palette.charcoal[500],
  },

  text: {
    primary: palette.white[50],
    secondary: palette.charcoal[250],
    tertiary: palette.charcoal[300],
    disabled: palette.charcoal[400],
    inverse: palette.charcoal[900],
    link: palette.charcoal[300],
    linkPressed: palette.charcoal[200],
    success: palette.green[400],
    error: palette.red[400],
    warning: palette.yellow[300],
    info: palette.blue[400],
    subtle: palette.charcoal[350],
    white: palette.white[50],
  },

  background: {
    default: palette.charcoal[900],
    inverse: palette.white[50],
    disabled: palette.charcoal[850],
    active: palette.charcoal[900],
    subtle: palette.charcoal[800],
    surface: palette.charcoal[850],
    success: palette.green[800],
    successSubtle: palette.green[900],
    error: palette.red[800],
    errorSubtle: palette.red[900],
    warning: palette.yellow[800],
    warningSubtle: palette.yellow[900],
    info: palette.blue[800],
    infoSubtle: palette.blue[900],
    overlay: 'rgba(255, 255, 255, 0.04)',
    scrim: 'rgba(13, 14, 16, 0.8)',
    backdrop: 'rgba(13, 14, 16, 0.6)',
  },

  border: {
    default: palette.charcoal[600],
    subtle: palette.charcoal[700],
    disabled: palette.charcoal[700],
    focus: palette.charcoal[400],
    active: palette.charcoal[400],
    success: palette.green[500],
    error: palette.red[500],
    warning: palette.yellow[500],
    info: palette.blue[500],
  },

  button: {
    primary: {
      default: palette.charcoal[400],
      pressed: palette.charcoal[300],
      disabled: palette.charcoal[700],
    },
    secondary: {
      default: palette.charcoal[900],
      pressed: palette.charcoal[850],
      disabled: palette.charcoal[900],
      border: palette.charcoal[400],
    },
    tertiary: {
      default: palette.charcoal[900],
      pressed: palette.charcoal[850],
      disabled: palette.charcoal[900],
    },
    destructive: {
      default: palette.red[600],
      pressed: palette.red[700],
      disabled: palette.charcoal[700],
    },
    success: {
      default: palette.green[600],
      pressed: palette.green[700],
      disabled: palette.charcoal[700],
    },
    warning: {
      default: palette.yellow[600],
      pressed: palette.yellow[700],
      disabled: palette.charcoal[700],
    },
  },

  icon: {
    default: palette.charcoal[250],
    primary: palette.white[50],
    secondary: palette.charcoal[300],
    tertiary: palette.charcoal[400],
    disabled: palette.charcoal[600],
    inverse: palette.charcoal[900],
    success: palette.green[400],
    error: palette.red[400],
    warning: palette.yellow[400],
    info: palette.blue[400],
  },

  status: {
    default: palette.blue[400],
    success: palette.green[400],
    error: palette.red[400],
    warning: palette.yellow[400],
    info: palette.blue[400],
  },
};