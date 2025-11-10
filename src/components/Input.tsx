import { BorderRadius, Colors, Spacing } from '@/src/constants/Colors';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'search';
}

export function Input({ 
  label,
  error,
  leftIcon,
  rightIcon,
  variant = 'default',
  style,
  ...props 
}: InputProps) {
  const inputStyle = [
    styles.base,
    styles[variant],
    error && styles.error,
    style,
  ];

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText variant="caption" color="textPrimary" style={styles.label}>
          {label}
        </ThemedText>
      )}
      <View style={styles.inputContainer}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={inputStyle}
          placeholderTextColor={Colors.textSecondary}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && (
        <ThemedText variant="caption" color="coral" style={styles.errorText}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  base: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
    flex: 1,
  },
  default: {
    // Default styles
  },
  search: {
    paddingLeft: Spacing.xl + Spacing.sm, // Space for search icon
  },
  error: {
    borderColor: Colors.coral,
  },
  leftIcon: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: Spacing.md,
    zIndex: 1,
  },
  errorText: {
    marginTop: Spacing.xs,
  },
});





