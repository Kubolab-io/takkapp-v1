// components/SharePlanButton.tsx
import { Colors } from '@/src/constants/Colors';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

interface SharePlanButtonProps {
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const SharePlanButton: React.FC<SharePlanButtonProps> = ({
  onPress,
  size = 'medium',
  style
}) => {
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, fontSize: 14 };
      case 'large':
        return { width: 48, height: 48, fontSize: 20 };
      default:
        return { width: 44, height: 44, fontSize: 18 };
    }
  };

  const buttonSize = getButtonSize();

  return (
    <TouchableOpacity
      style={[
        styles.shareButton,
        {
          width: buttonSize.width,
          height: buttonSize.height,
        },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.shareButtonText,
        { fontSize: buttonSize.fontSize }
      ]}>
        📅
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shareButton: {
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  shareButtonText: {
    color: '#FFFFFF',
  },
});


