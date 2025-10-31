import { Colors, Typography } from '@/src/constants/Colors';
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
  color?: keyof typeof Colors;
  children: React.ReactNode;
}

export function ThemedText({ 
  variant = 'body', 
  color = 'textPrimary', 
  style, 
  children, 
  ...props 
}: ThemedTextProps) {
  const textStyle = [
    styles.base,
    styles[variant],
    { color: Colors[color] },
    style,
  ];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Typography.fontFamily.regular,
  },
  h1: {
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.bold,
    lineHeight: Typography.lineHeight.tight,
  },
  h2: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    lineHeight: Typography.lineHeight.tight,
  },
  h3: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: Typography.lineHeight.normal,
  },
  body: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.lineHeight.normal,
  },
  caption: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.lineHeight.normal,
  },
  button: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.lineHeight.normal,
  },
});