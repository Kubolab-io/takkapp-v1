import { BorderRadius, Colors, Spacing } from '@/src/constants/Colors';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface ThemedViewProps extends ViewProps {
  variant?: 'card' | 'container' | 'button' | 'input';
  padding?: keyof typeof Spacing;
  margin?: keyof typeof Spacing;
  borderRadius?: keyof typeof BorderRadius;
  backgroundColor?: keyof typeof Colors;
  shadow?: boolean;
  children: React.ReactNode;
}

export function ThemedView({ 
  variant = 'container',
  padding,
  margin,
  borderRadius = 'lg',
  backgroundColor = 'white',
  shadow = false,
  style, 
  children, 
  ...props 
}: ThemedViewProps) {
  const viewStyle = [
    styles.base,
    styles[variant],
    padding && { padding: Spacing[padding] },
    margin && { margin: Spacing[margin] },
    { borderRadius: BorderRadius[borderRadius] },
    { backgroundColor: Colors[backgroundColor] },
    shadow && styles.shadow,
    style,
  ];

  return (
    <View style={viewStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    // Base styles
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  button: {
    backgroundColor: Colors.dark,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  shadow: {
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
});