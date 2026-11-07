export const palette = {
  // Hok identity: ink, bone, and one rust accent (see assets/brand)
  hok: {
    ink: '#121210',
    bone: '#EAE7DF',
    rust: '#C2461B',
  },

  // TAPT brand ramp (teal / emerald)
  tapt: {
    50: '#EEF8F6',
    100: '#D5EFEA',
    200: '#ABDFD5',
    300: '#76C8B9',
    400: '#43AC9A',
    500: '#22907F',
    600: '#177466',
    700: '#135D53',
    800: '#114A43',
    900: '#0D3833',
    950: '#06201D',
  },

  // Neutral ramp, tinted slightly toward the brand
  slate: {
    25: '#FAFCFB',
    50: '#F5F8F7',
    100: '#EAF1EF',
    150: '#E6ECEA',
    200: '#D6DEDC',
    300: '#B4C0BD',
    400: '#8A9895',
    500: '#6B7876',
    600: '#4B5856',
    700: '#33403D',
    750: '#26332F',
    800: '#1C2725',
    850: '#1B2625',
    900: '#131C1B',
    950: '#0B1211',
  },

  amber: {
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },

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

export type Gradient = {
  /** Full-bleed header / hero gradient (start → end). */
  header: [string, string];
  /** Subtle tinted gradient for cards and image placeholders. */
  soft: [string, string];
};

export type ColorPallete = {
  isDark: boolean;
  gradient: Gradient;
  brand: Brand;
  text: Text;
  background: Background;
  border: Border;
  button: Button;
  icon: Icon;
  status: Status;
};

// Monochrome, borderless system. Separation comes from tone and space;
// borders are transparent except the faint hairline used inside lists.
const ink = {
  0: '#FFFFFF',
  50: '#FAFAFA',
  100: '#F4F4F5',
  150: '#EDEDEF',
  200: '#E4E4E7',
  300: '#D4D4D8',
  400: '#A1A1AA',
  500: '#71717A',
  600: '#52525B',
  700: '#3F3F46',
  800: '#262626',
  850: '#1F1F1F',
  900: '#161616',
  950: '#0A0A0A',
};

const emerald = {
  50: '#ECFDF5',
  400: '#34D399',
  500: '#10B981',
  600: '#059669',
  700: '#047857',
};

// Light Mode Colors
export const LightColors: ColorPallete = {
  isDark: false,
  // Kept for API compatibility; flat on purpose (no gradients).
  gradient: {
    header: [ink[0], ink[0]],
    soft: [ink[100], ink[150]],
  },

  brand: {
    primary: ink[950],
    secondary: ink[600],
    accent: emerald[600],
  },

  text: {
    primary: ink[950],
    secondary: ink[600],
    tertiary: ink[500],
    disabled: ink[400],
    inverse: ink[0],
    link: emerald[700],
    linkPressed: ink[950],
    success: emerald[700],
    error: palette.red[600],
    warning: '#B45309',
    info: palette.blue[600],
    subtle: ink[500],
    white: ink[0],
  },

  background: {
    default: ink[0],
    inverse: ink[950],
    disabled: ink[100],
    active: emerald[50],
    subtle: ink[150],
    surface: ink[100],
    success: emerald[500],
    successSubtle: 'rgba(16, 185, 129, 0.12)',
    error: palette.red[500],
    errorSubtle: 'rgba(239, 68, 68, 0.10)',
    warning: palette.amber[500],
    warningSubtle: 'rgba(245, 158, 11, 0.14)',
    info: palette.blue[500],
    infoSubtle: 'rgba(59, 130, 246, 0.10)',
    overlay: 'rgba(10, 10, 10, 0.05)',
    scrim: 'rgba(10, 10, 10, 0.45)',
    backdrop: 'rgba(10, 10, 10, 0.35)',
  },

  border: {
    default: 'transparent',
    subtle: 'rgba(10, 10, 10, 0.06)',
    disabled: 'transparent',
    focus: emerald[600],
    active: ink[950],
    success: emerald[500],
    error: palette.red[500],
    warning: palette.amber[500],
    info: palette.blue[500],
  },

  button: {
    primary: {
      default: ink[950],
      pressed: ink[700],
      disabled: ink[200],
    },
    secondary: {
      default: ink[100],
      pressed: ink[200],
      disabled: ink[100],
      border: 'transparent',
    },
    tertiary: {
      default: ink[100],
      pressed: ink[200],
      disabled: ink[50],
    },
    destructive: {
      default: palette.red[600],
      pressed: palette.red[700],
      disabled: ink[200],
    },
    success: {
      default: emerald[600],
      pressed: emerald[700],
      disabled: ink[200],
    },
    warning: {
      default: palette.amber[500],
      pressed: palette.amber[600],
      disabled: ink[200],
    },
  },

  icon: {
    default: ink[800],
    primary: ink[950],
    secondary: ink[600],
    tertiary: ink[400],
    disabled: ink[300],
    inverse: ink[0],
    success: emerald[600],
    error: palette.red[600],
    warning: '#B45309',
    info: palette.blue[600],
  },

  status: {
    default: ink[950],
    success: emerald[600],
    error: palette.red[600],
    warning: palette.amber[600],
    info: palette.blue[600],
  },
};

// Dark Mode Colors
export const DarkColors: ColorPallete = {
  isDark: true,
  gradient: {
    header: [ink[950], ink[950]],
    soft: [ink[900], ink[850]],
  },

  brand: {
    primary: ink[50],
    secondary: ink[400],
    accent: emerald[400],
  },

  text: {
    primary: ink[50],
    secondary: ink[400],
    tertiary: '#8A8A93',
    disabled: ink[600],
    inverse: ink[950],
    link: emerald[400],
    linkPressed: ink[50],
    success: emerald[400],
    error: palette.red[400],
    warning: palette.amber[400],
    info: palette.blue[400],
    subtle: '#8A8A93',
    white: ink[0],
  },

  background: {
    default: ink[950],
    inverse: ink[50],
    disabled: ink[900],
    active: 'rgba(16, 185, 129, 0.14)',
    subtle: ink[850],
    surface: ink[900],
    success: emerald[600],
    successSubtle: 'rgba(52, 211, 153, 0.14)',
    error: palette.red[600],
    errorSubtle: 'rgba(248, 113, 113, 0.14)',
    warning: palette.amber[500],
    warningSubtle: 'rgba(251, 191, 36, 0.14)',
    info: palette.blue[600],
    infoSubtle: 'rgba(96, 165, 250, 0.14)',
    overlay: 'rgba(255, 255, 255, 0.05)',
    scrim: 'rgba(0, 0, 0, 0.7)',
    backdrop: 'rgba(0, 0, 0, 0.55)',
  },

  border: {
    default: 'transparent',
    subtle: 'rgba(255, 255, 255, 0.08)',
    disabled: 'transparent',
    focus: emerald[400],
    active: ink[50],
    success: emerald[400],
    error: palette.red[400],
    warning: palette.amber[400],
    info: palette.blue[400],
  },

  button: {
    primary: {
      default: ink[50],
      pressed: ink[300],
      disabled: ink[800],
    },
    secondary: {
      default: ink[900],
      pressed: ink[800],
      disabled: ink[900],
      border: 'transparent',
    },
    tertiary: {
      default: ink[900],
      pressed: ink[800],
      disabled: ink[900],
    },
    destructive: {
      default: palette.red[500],
      pressed: palette.red[400],
      disabled: ink[800],
    },
    success: {
      default: emerald[500],
      pressed: emerald[400],
      disabled: ink[800],
    },
    warning: {
      default: palette.amber[400],
      pressed: palette.amber[300],
      disabled: ink[800],
    },
  },

  icon: {
    default: ink[200],
    primary: ink[50],
    secondary: ink[400],
    tertiary: '#8A8A93',
    disabled: ink[700],
    inverse: ink[950],
    success: emerald[400],
    error: palette.red[400],
    warning: palette.amber[400],
    info: palette.blue[400],
  },

  status: {
    default: ink[50],
    success: emerald[400],
    error: palette.red[400],
    warning: palette.amber[400],
    info: palette.blue[400],
  },
};
