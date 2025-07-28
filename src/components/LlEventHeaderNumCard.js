import React, { useMemo } from 'react'
import { TouchableOpacity, Image } from 'react-native'
import { WsCard, WsIcon, WsText, WsFlex, WsLoading, WsIconBtn } from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
// import Crashes from 'appcenter-crashes';
// import Analytics from 'appcenter-analytics';

const LlEventHeaderNumCard = props => {

  // Props
  const {
    text,
    num,
    icon,
    img,
    iconColor,
    style,
    numLoading,
    onPress,
    upperRightOnPress
  } = props

  // Memo
  const _num = useMemo(() => {
    const isReady = !numLoading && num != null;
    return isReady
      ? <WsText size={12} fontWeight={600}>{num}</WsText>
      : <WsLoading size="small" />;
  }, [numLoading, num]);

  // Render
  return (
    <>
      <TouchableOpacity onPress={onPress}>
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
              marginRight: 16,
            }}
          >
            {icon && <WsIcon name={icon} color={iconColor} size={24} />}
            {img && (
              <Image
                style={{
                  width: 24,
                  height: 24,
                  marginRight: 8
                }}
                source={{ uri: img }}
              />
            )}
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

export default LlEventHeaderNumCard
