import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Base
    text: '#0F172A',
    background: '#F8FAFC',
    tint: '#F0782D',
    secondary: '#1e4b69',
    icon: '#64748B',
    border: '#E2E8F0',
    // Tab bar
    tabBar: '#FFFFFF',
    tabBarBorder: '#F3F4F6',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#F0782D',
    // Cards & surfaces
    card: '#FFFFFF',
    cardBorder: '#F1F5F9',
    // Inputs
    inputBg: '#F8FAFC',
    // Sheets & modals
    sheet: '#FFFFFF',
    sheetHandle: '#E2E8F0',
    // Text hierarchy
    mutedText: '#64748B',
    subtleText: '#94A3B8',
    // Action sheet options
    cancelBg: '#F1F5F9',
    optionBg: '#F8FAFC',
    optionBorder: '#F1F5F9',
    // Danger palette
    dangerBg: '#FFF5F5',
    dangerBorder: '#FEE2E2',
    dangerText: '#DC2626',
    dangerIconBg: '#FEE2E2',
    // Normal icon palette
    normalIconBg: '#E0F2FE',
    normalIconColor: '#1E4B69',
  },
  dark: {
    // Base
    text: '#F8FAFC',
    background: '#0F172A',
    tint: '#F0782D',
    secondary: '#F0782D',
    icon: '#94A3B8',
    border: '#1E293B',
    // Tab bar
    tabBar: '#0F172A',
    tabBarBorder: '#1E293B',
    tabIconDefault: '#475569',
    tabIconSelected: '#F0782D',
    // Cards & surfaces
    card: '#1E293B',
    cardBorder: '#334155',
    // Inputs
    inputBg: '#1E293B',
    // Sheets & modals
    sheet: '#1E293B',
    sheetHandle: '#475569',
    // Text hierarchy
    mutedText: '#94A3B8',
    subtleText: '#64748B',
    // Action sheet options
    cancelBg: '#334155',
    optionBg: '#0F172A',
    optionBorder: '#1E293B',
    // Danger palette
    dangerBg: '#2D1515',
    dangerBorder: '#7F1D1D',
    dangerText: '#F87171',
    dangerIconBg: '#7F1D1D',
    // Normal icon palette
    normalIconBg: '#0C3A5A',
    normalIconColor: '#38BDF8',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
export const AppFonts = {
  heading: 'Poppins_700Bold',
  subheading: 'Poppins_600SemiBold',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  label: 'Manrope_600SemiBold',
};
