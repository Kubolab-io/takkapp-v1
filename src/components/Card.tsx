import { BorderRadius, Colors, Spacing } from '@/src/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ThemedView } from './ThemedView';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof Spacing;
  onPress?: () => void;
}

export function Card({ 
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
  ...props 
}: CardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    style,
  ];

  const CardComponent = onPress ? TouchableOpacity : ThemedView;

  return (
    <CardComponent style={cardStyle} onPress={onPress} {...props}>
      {children}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  default: {
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
});





