export const colors = {
  background: '#F6F7F9',
  surface: '#FFFFFF',
  border: '#D9DEE3',
  text: '#11181C',
  textMuted: '#5F6B76',
  primary: '#1F6FEB',
  primaryText: '#FFFFFF',
  danger: '#C62828',
  dangerBackground: '#FDECEA',
  warning: '#8A5A00',
  warningBackground: '#FFF4D6',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12 } as const;

export const fontSize = { sm: 13, md: 15, lg: 17, xl: 22, xxl: 28 } as const;

/** Minimum tap target in px. */
export const MIN_TAP = 44;

/** Keeps content phone-sized when the page is opened on a wide screen. */
export const MAX_CONTENT_WIDTH = 480;
