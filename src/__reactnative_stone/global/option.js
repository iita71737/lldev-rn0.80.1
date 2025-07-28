import React from 'react'
import $color from '@/__reactnative_stone/global/color'
import {
  WsIcon,
} from '@/components'

const CustomBackButton = () => {
  return (
    <WsIcon
      style={{
        padding: 8,
      }}
      name="md-arrow-back"
      size={24}
      color={$color.white}
    >
    </WsIcon>
  );
};

const option = {
  headerOption: {
    // headerBackImage: () => <CustomBackButton />,
    headerStyle: {
      borderBottomWidth: 0,
      elevation: 0,
      backgroundColor: $color.primary
    },
    headerTitleStyle: {
      fontSize: 17,
      color: $color.white
    },
    headerTitleAlign: 'center',
    headerTintColor: '#fff',
    // 231228-Navigation BUG
    // transitionSpec: {
    //   open: {
    //     animation: 'spring',
    //     config: {
    //       stiffness: 1000,
    //       damping: 500,
    //       mass: 0.5,
    //       overshootClamping: true,
    //       restDisplacementThreshold: 0,
    //       restSpeedThreshold: 0
    //     }
    //   },
    //   close: {
    //     animation: 'timing',
    //     config: {
    //       duration: 50
    //     }
    //   }
    // }
  },
  cardStyle: { backgroundColor: 'black' }
}
export default option
