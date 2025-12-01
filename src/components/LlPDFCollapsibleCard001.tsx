// CollapsibleCard.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { WsFlex, WsIcon, WsText } from '@/components'; // 你自己的元件

type Props = {
  title: string;
  rightActions?: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
};

export const CollapsibleCard: React.FC<Props> = ({
  title,
  rightActions,
  collapsed,
  onToggle,
  children,
}) => {
  return (
    <View style={{ borderRadius: 10, borderWidth: 0.4 }}>
      {/* Header */}
      <WsFlex
        style={{
          paddingVertical: 16,
          paddingHorizontal: 8,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* 左邊：箭頭 + 標題 */}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <WsIcon
            name={collapsed ? 'md-unfold-more' : 'md-unfold-less'}
            size={24}
          />
          <WsText style={{ marginLeft: 8 }}>{title}</WsText>
        </TouchableOpacity>

        {/* 右邊：自訂按鈕區 */}
        <WsFlex style={{ justifyContent: 'flex-end' }}>
          {rightActions}
        </WsFlex>
      </WsFlex>

      {/* Body */}
      {!collapsed && (
        <View
          style={{
            borderTopWidth: 0.4,
            paddingVertical: 16,
            backgroundColor: 'white',
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
};
