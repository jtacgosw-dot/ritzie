export interface ThemeConfig {
  id: string;
  name: string;
  brand: {
    logoUrl?: string;
    avatarUrl?: string;
    accent: string;
  };
  colors: {
    light: {
      bg: string;
      panel: string;
      text: string;
      muted: string;
      divider: string;
      chip: string;
      input: string;
    };
    dark: {
      bg: string;
      panel: string;
      text: string;
      muted: string;
      divider: string;
      chip: string;
      input: string;
    };
  };
  typography: {
    fontFamily: string;
    baseSize: number;
    lineHeight: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  space: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadow: {
    elevation: string;
  };
  layout: {
    mode: 'bubble' | 'page';
    bubbleWidth: number;
    bubbleMaxHeightVh: number;
    pageHeader: boolean;
    mountSelector?: string;
  };
  motion: {
    curvePrimary: string;
    durations: {
      micro: number;
      content: number;
      macro: number;
      stagger: number;
    };
    reducedMotion: boolean;
  };
  components: {
    message: {
      userBg: string;
      botBg: string;
    };
    chip: {
      bordered: boolean;
    };
    button: {
      style: string;
    };
  };
  personality: {
    tone: 'calm_pro' | 'friendly_helpful' | 'salesy_confident' | 'playful_light';
    emoji: boolean;
  };
}

export interface ThemeOverrides {
  brand?: Partial<ThemeConfig['brand']>;
  colors?: {
    light?: Partial<ThemeConfig['colors']['light']>;
    dark?: Partial<ThemeConfig['colors']['dark']>;
  };
  typography?: Partial<ThemeConfig['typography']>;
  radius?: Partial<ThemeConfig['radius']>;
  space?: Partial<ThemeConfig['space']>;
  shadow?: Partial<ThemeConfig['shadow']>;
  layout?: Partial<ThemeConfig['layout']>;
  motion?: Partial<ThemeConfig['motion']>;
  components?: Partial<ThemeConfig['components']>;
  personality?: Partial<ThemeConfig['personality']>;
}

export interface ThemeVersion {
  version: string;
  theme: ThemeConfig;
  createdAt: Date;
  createdBy: string;
}
