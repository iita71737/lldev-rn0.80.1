import React from 'react'
import { Platform, Pressable, View } from 'react-native'
import { FAB, Portal } from 'react-native-paper'
import { WsGradientButton, WsIcon } from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'

interface WsFABGroupProps {
  canShowFloatingAction?: boolean;
  useFabGroup?: boolean;
  FABItems?: WsFABGroupItem[];
  onFilterPress?: () => void;
  showDefaultFilterAction?: boolean;
  fabAnchorStyle?: any;
  customActionsContainerStyle?: any;
}

export interface WsFABGroupItem {
  icon?: any;
  label?: string;
  onPress?: () => void;
  color?: string;
  style?: any;
  labelStyle?: any;
  labelTextColor?: string;
  small?: boolean;
  testID?: string;
}

export interface WsFABGroupConfig {
  hideActionIcon?: boolean;
  fabGroupColor?: string;
  fabGroupStyle?: any;
  backdropColor?: string;
}

const WsFABGroup: React.FC<WsFABGroupProps> = ({
  canShowFloatingAction = true,
  useFabGroup = true,
  FABItems,
  onFilterPress = () => { },
  showDefaultFilterAction = false,
  fabAnchorStyle,
  customActionsContainerStyle,
}) => {
  const { t } = useTranslation()
  const [fabGroupOpen, setFabGroupOpen] = React.useState(false)
  const floatingActionConfig: WsFABGroupConfig = React.useMemo(() => ({
    hideActionIcon: false,
    fabGroupColor: $color.white,
    fabGroupStyle: undefined,
    backdropColor: 'rgba(0,0,0,0.24)'
  }), [])
  const defaultFloatingActionItem: WsFABGroupItem = React.useMemo(() => ({
    icon: undefined,
    label: t('操作'),
    onPress: () => { },
    color: $color.white,
    style: {},
    labelStyle: {},
    labelTextColor: $color.black,
    small: false,
    testID: ''
  }), [t])

  const defaultFilterFabAction = React.useMemo(() => ({
    label: t('篩選條件'),
    color: $color.white,
    style: {
      backgroundColor: $color.primary,
    },
    labelTextColor: $color.black,
    onPress: () => {
      setFabGroupOpen(false)
      onFilterPress?.()
    },
    testID: 'WsFilter002',
  }), [t, onFilterPress])

  const fabGroupActions = React.useMemo(() => {
    const extraActions = Array.isArray(FABItems)
      ? FABItems
      : []
    const baseActions = showDefaultFilterAction
      ? [defaultFilterFabAction, ...extraActions]
      : extraActions
    return baseActions.map(action => ({
      ...defaultFloatingActionItem,
      ...action,
      onPress: () => {
        setFabGroupOpen(false)
        action?.onPress?.()
      }
    }))
  }, [FABItems, defaultFilterFabAction, defaultFloatingActionItem, showDefaultFilterAction])

  const customGradientActions = React.useMemo(
    () => fabGroupActions.filter(action => floatingActionConfig?.hideActionIcon || !action?.icon),
    [fabGroupActions, floatingActionConfig?.hideActionIcon]
  )

  const paperFabActions = React.useMemo(
    () => fabGroupActions
      .filter(action => !floatingActionConfig?.hideActionIcon && !!action?.icon)
      .map(action => ({
        ...action,
        color: action?.color ?? $color.white,
        style: {
          backgroundColor: $color.primary,
          ...action?.style
        },
        labelTextColor: action?.labelTextColor ?? $color.black,
        labelStyle: {
          opacity: 1,
          ...action?.labelStyle
        }
      })),
    [fabGroupActions, floatingActionConfig?.hideActionIcon]
  )

  if (!canShowFloatingAction || !useFabGroup) {
    return null
  }

  return (
    <Portal>
      {fabGroupOpen && (
        <Pressable
          onPress={() => setFabGroupOpen(false)}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: floatingActionConfig?.backdropColor ?? 'rgba(0,0,0,0.24)'
          }}
        />
      )}
      {fabGroupOpen && customGradientActions.length > 0 && (
        <View
          style={[
            {
              position: 'absolute',
              right: 24,
              bottom: 120,
              alignItems: 'flex-end'
            },
            customActionsContainerStyle
          ]}
        >
          {customGradientActions.map((action, index) => (
            <WsGradientButton
              key={`${action?.label || 'action'}-${index}`}
              style={{
                minWidth: 132,
                marginTop: index === 0 ? 0 : 8,
                paddingHorizontal: 12
              }}
              onPress={() => {
                action?.onPress?.()
              }}
            >
              {action?.label || defaultFloatingActionItem.label}
            </WsGradientButton>
          ))}
        </View>
      )}
      {paperFabActions.length > 0 ? (
        <FAB.Group
          visible={true}
          open={fabGroupOpen}
          onStateChange={({ open }) => setFabGroupOpen(open)}
          icon={({ size, color }) => (
            <WsIcon
              name={fabGroupOpen ? 'fa-close' : 'fa-menu'}
              size={size}
              color={color}
            />
          )}
          color={floatingActionConfig?.fabGroupColor ?? $color.white}
          backdropColor={'transparent'}
          actions={paperFabActions}
          style={{
            position: 'absolute',
            bottom: Platform.select({ ios: 80, android: 96 }),
            right: 24,
            ...(fabAnchorStyle || {})
          }}
          fabStyle={[
            {
              backgroundColor: $color.primary,
              zIndex: 999,
              elevation: 10
            },
            floatingActionConfig?.fabGroupStyle
          ]}
        />
      ) : (
        <FAB
          visible={true}
          icon={({ size, color }) => (
            <WsIcon
              name={fabGroupOpen ? 'md-close' : 'll-nav-app-menu'}
              size={size}
              color={color}
            />
          )}
          onPress={() => setFabGroupOpen(prev => !prev)}
          color={floatingActionConfig?.fabGroupColor ?? $color.white}
          style={[
            {
              position: 'absolute',
              bottom: Platform.select({ ios: 48, android: 48 }),
              right: 32,
              backgroundColor: $color.primary,
              zIndex: 999,
              elevation: 10
            },
            fabAnchorStyle,
            floatingActionConfig?.fabGroupStyle
          ]}
        />
      )}
    </Portal>
  )
}

export default WsFABGroup
