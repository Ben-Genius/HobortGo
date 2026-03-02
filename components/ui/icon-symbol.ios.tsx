/**
 * Cross-platform icon component using Ionicons from @expo/vector-icons.
 * This replaces the SF Symbols version so that iOS and Android are identical.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

export type IconSymbolName = ComponentProps<typeof Ionicons>['name'];

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return <Ionicons color={color} size={size} name={name} style={style as any} />;
}
