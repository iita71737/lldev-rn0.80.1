import React, { useMemo } from 'react'
import { TouchableOpacity } from 'react-native'
import { WsCard, WsIcon, WsText, WsFlex, WsLoading, WsIconBtn } from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
// import Crashes from 'appcenter-crashes';
// import Analytics from 'appcenter-analytics';

const LlLicenseHeaderNumCard = props => {

  // Props
  const {
    text,
    num,
    icon,
    iconColor,
    style,
    numLoading,
    onPress,
    upperRightOnPress,
    testID
  } = props

  // Memo
  const _num = React.useMemo(() => {
    return numLoading === false && num !== undefined ? <WsText size={12} fontWeight={600}>{num}{''}</WsText> : <WsLoading size="small" />
  }, [num])

  // Render
  return (
    <>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
      >
        <WsCard
          padding={4}
          style={[style]}
        >
          <WsIconBtn
            underlayColor={$color.primary}
            color={$color.white}
            isRound={false}
            padding={4}
            size={12}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              borderTopRightRadius: 10,
              borderBottomLeftRadius: 10,
            }}
            name="bih-add"
            onPress={upperRightOnPress}
          ></WsIconBtn>
          <WsFlex
            justifyContent="center"
            style={{
              // marginRight: 16,
            }}
          >
            {/* {icon && <WsIcon name={icon} color={iconColor} size={24} />} */}
            <WsFlex flexDirection="column">
              <WsText size={12} style={{ marginVertical: 2 }}>
                {text}
              </WsText>
              {_num}
            </WsFlex>
          </WsFlex>
        </WsCard>
      </TouchableOpacity>
    </>
  )
}

export default LlLicenseHeaderNumCard
