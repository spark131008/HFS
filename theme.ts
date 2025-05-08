// Helper function to combine multiple classes
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

// Theme configuration
const theme = {
  colors: {
    primary: {
      from: 'from-indigo-600',
      to: 'to-purple-600',
      hover: {
        from: 'hover:from-indigo-700',
        to: 'hover:to-purple-700',
      },
    },
    accent: {
      blue: 'text-blue-600',
    },
    background: {
      light: 'bg-white',
      gradient: 'bg-gradient-to-r from-indigo-50 to-purple-50',
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      white: 'text-white',
      gradient: 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600',
    },
    border: {
      light: 'border-gray-100',
      primary: 'border-indigo-600',
    },
  },
  typography: {
    fontFamily: {
      display: 'font-playfair',
      sans: 'font-inter',
    },
    fontSize: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
    },
    fontWeight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  spacing: {
    container: 'container mx-auto px-4',
    section: {
      default: 'py-20',
      small: 'py-10',
    },
  },
  effects: {
    shadow: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    },
    blur: {
      xl: 'blur-3xl',
    },
    gradient: {
      primary: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      background: 'bg-gradient-to-r from-indigo-50 to-purple-50',
    },
  },
  transitions: {
    colors: 'transition-colors',
    transform: 'transition-transform',
    shadow: 'transition-shadow',
  },
  borderRadius: {
    full: 'rounded-full',
    default: 'rounded-lg',
  },
  layout: {
    flex: {
      center: 'flex items-center justify-center',
      between: 'flex items-center justify-between',
    },
    grid: {
      center: 'grid place-items-center',
    },
  },
  zIndex: {
    header: 'z-50',
    modal: 'z-40',
    dropdown: 'z-30',
  },
  button: {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-colors',
    secondary: 'bg-indigo-600 hover:bg-indigo-700 text-white transition-colors',
    outline: 'border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 transition-colors',
    secondary2: 'bg-purple-600 hover:bg-purple-700 text-white transition-colors',
  },
} as const;

// Common component styles
const componentStyles = {
  button: {
    primary: cn(
      theme.effects.gradient.primary,
      theme.colors.text.white,
      theme.transitions.colors,
      'hover:opacity-90'
    ),
    secondary: cn(
      'bg-indigo-600',
      'hover:bg-indigo-700',
      theme.colors.text.white,
      theme.transitions.colors
    ),
    outline: cn(
      'border',
      theme.colors.border.primary,
      'text-indigo-600',
      'bg-white',
      'hover:bg-indigo-50',
      theme.transitions.colors
    ),
    secondary2: cn(
      'bg-purple-600',
      'hover:bg-purple-700',
      theme.colors.text.white,
      theme.transitions.colors,
      'border-purple-300'
    ),
  },
  card: cn(
    theme.colors.background.light,
    theme.effects.shadow.md,
    theme.borderRadius.default,
    'p-6'
  ),
  input: cn(
    theme.colors.background.light,
    theme.borderRadius.default,
    'border border-gray-200',
    'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
    'px-4 py-2'
  ),
} as const;

export { theme, cn, componentStyles };
export type Theme = typeof theme; 