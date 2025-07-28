// import React, { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react'
// import {
//   StyleSheet,
//   Animated,
//   View,
//   TouchableHighlight,
//   Text,
//   ViewStyle
// } from 'react-native'
// import { useFocusEffect } from '@react-navigation/native'
// import { useTranslation } from 'react-i18next'
// import { useRoute } from '@react-navigation/native';
// import { useNavigation } from '@react-navigation/native';
// interface TabItem {
//   value: string;
//   label: string;
//   badge?: string;
// }

// interface WsToggleTabBarProps {
//   items: TabItem[];
//   value: string;
//   onPress: (value: string, index: number) => void;
//   activeTabBackgroundColor?: string;
//   style?: ViewStyle;
//   tabIndex?: number;
// }

// const WsToggleTabBar: React.FC<WsToggleTabBarProps> = ({
//   items,
//   value,
//   onPress,
//   activeTabBackgroundColor = '#0860ac',
//   style,
//   tabIndex
// }) => {
//   const { t, i18n } = useTranslation()
//   // const route = useRoute();
//   // const navigation = useNavigation();

//   // REF
//   const translateX = useRef(new Animated.Value(0)).current

//   // State
//   const [containerWidth, setContainerWidth] = useState(0)

//   // Function
//   const getDimensions = (event: any) => {
//     const { nativeEvent } = event
//     const { x, y, width, height } = nativeEvent.layout
//     setContainerWidth(width)
//   }
//   const getTabWidth = () => {
//     const tabMargin = 4
//     return containerWidth / items.length - tabMargin
//   }

//   const $_onPress = (value: any, index: number) => {
//     const deltaX = containerWidth / items.length
//     Animated.spring(translateX, {
//       toValue: index * deltaX,
//       friction: 7,
//       tension: 40,
//       overshootClamping: true,
//       useNativeDriver: true
//     }).start()
//     onPress(value, index)
//   }

//   useEffect(() => {
//     if (tabIndex !== undefined) {
//       const deltaX = containerWidth / items.length
//       translateX.setValue(tabIndex * deltaX)
//     }
//   }, [tabIndex, containerWidth, value])

//   // Render
//   return (
//     <View style={[styles.container, style]} onLayout={getDimensions}>
//       <Animated.View
//         style={[
//           styles.activeTabBg,
//           { backgroundColor: activeTabBackgroundColor },
//           { width: getTabWidth() },
//           { transform: [{ translateX: translateX }] }
//         ]}
//       />
//       {items.map((item, index) => {
//         return (
//           <TouchableHighlight
//             testID={item.label}
//             key={index}
//             style={styles.tabBarItem}
//             activeOpacity={1}
//             underlayColor="transparent"
//             onPress={() => $_onPress(item.value, index)}>
//             <View style={styles.tabBar}>
//               <Text
//                 style={[
//                   styles.tabBarText,
//                   value === item.value ? styles.tabBarTextActive : null
//                 ]}>
//                 {t(item.label)}
//               </Text>
//               {item.badge != undefined && (
//                 <View style={styles.tabBarBadge}>
//                   <Text style={styles.tabBarBadgeText}>{item.badge}</Text>
//                 </View>
//               )}
//             </View>
//           </TouchableHighlight>
//         )
//       })}
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     paddingVertical: 2,
//     paddingHorizontal: 1,
//     borderRadius: 8,
//     backgroundColor: 'rgba(0,0,0,0.2)',
//   },
//   activeTabBg: {
//     position: 'absolute',
//     top: 2,
//     left: 2,
//     height: '100%',
//     borderRadius: 6
//   },
//   tabBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   tabBarItem: {
//     flex: 1,
//     marginHorizontal: 1,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   tabBarText: {
//     fontSize: 12,
//     lineHeight: 18,
//     textAlign: 'center',
//     color: '#ffffff'
//   },
//   tabBarTextActive: {
//     fontWeight: '700'
//   },
//   tabBarBadge: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: 8,
//     width: 20,
//     height: 18,
//     borderRadius: 11,
//     backgroundColor: '#ffffff'
//   },
//   tabBarBadgeText: {
//     fontSize: 12,
//     fontWeight: '700',
//     lineHeight: 18,
//     textAlign: 'center',
//     color: '#0585d3'
//   }
// })

// export default WsToggleTabBar


import React, { useRef, useState, useEffect, useMemo } from 'react'
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Text,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'

interface TabItem {
  value: string
  label: string
  badge?: string
}

interface WsToggleTabBarProps {
  items: TabItem[]
  value: string
  onPress: (value: string, index: number) => void
  activeTabBackgroundColor?: string
  style?: ViewStyle
  tabIndex?: number
}

const WsToggleTabBar: React.FC<WsToggleTabBarProps> = ({
  items,
  value,
  onPress,
  activeTabBackgroundColor = '#0860ac',
  style,
  tabIndex,
}) => {
  const { t } = useTranslation()

  const translateX = useSharedValue(0)
  const [containerWidth, setContainerWidth] = useState(0)

  const tabWidth = useMemo(() => {
    const tabMargin = 4
    return items.length > 0 ? containerWidth / items.length - tabMargin : 0
  }, [containerWidth, items.length])

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout
    setContainerWidth(width)
  }

  const handlePress = (val: string, index: number) => {
    const deltaX = containerWidth / items.length
    translateX.value = withSpring(index * deltaX, {
      damping: 15,
      stiffness: 120,
    })
    onPress(val, index)
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabWidth,
  }))

  useEffect(() => {
    if (tabIndex !== undefined && containerWidth > 0) {
      const deltaX = containerWidth / items.length
      translateX.value = deltaX * tabIndex
    }
  }, [tabIndex, containerWidth, items.length])

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <Animated.View
        style={[
          styles.activeTabBg,
          { backgroundColor: activeTabBackgroundColor },
          animatedStyle,
        ]}
      />
      {items.map((item, index) => (
        <TouchableHighlight
          key={item.value}
          testID={item.label}
          style={styles.tabBarItem}
          activeOpacity={1}
          underlayColor="transparent"
          onPress={() => handlePress(item.value, index)}
        >
          <View style={styles.tabBar}>
            <Text
              style={[
                styles.tabBarText,
                value === item.value ? styles.tabBarTextActive : null,
              ]}
            >
              {t(item.label)}
            </Text>
            {item.badge !== undefined && (
              <View style={styles.tabBarBadge}>
                <Text style={styles.tabBarBadgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
        </TouchableHighlight>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  activeTabBg: {
    position: 'absolute',
    top: 2,
    left: 2,
    height: '100%',
    borderRadius: 6,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarItem: {
    flex: 1,
    marginHorizontal: 1,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabBarText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#ffffff',
  },
  tabBarTextActive: {
    fontWeight: '700',
  },
  tabBarBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    width: 20,
    height: 18,
    borderRadius: 11,
    backgroundColor: '#ffffff',
  },
  tabBarBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
    color: '#0585d3',
  },
})

export default WsToggleTabBar
