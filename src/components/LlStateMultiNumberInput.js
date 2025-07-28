import React, { useState } from 'react';
import {
  View,
} from 'react-native';
import {
  WsStateRadioItem,
  WsState,
  WsFlex,
  WsText
} from '@/components';
import $config from '@/__config';
import $color from '@/__reactnative_stone/global/color';
import $theme from '@/__reactnative_stone/global/theme';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next'

const LlStateMultiNumberInput = ({
  value,
  onChange,
  disabled = false,
  borderColorError = $color.danger,
  backgroundColorError = $color.danger11l,
  borderWidth = 0.2,
  borderRadius = 10,
  items,
}) => {
  const { t, i18n } = useTranslation()

  // Redux
  const currentFactory = useSelector((state) => state.data.currentFactory);

  // State
  const [checked, setChecked] = useState(true);
  const [isError, setIsError] = React.useState((value && value.years && value.hours) ? false : true)

  // onPress
  const $_handlePress = (e) => {
    if (e && e.hours && e.years) {
      setIsError(false)
    } else {
      setIsError(true)
    }
    onChange(e);
  };


  // Render
  return (
    <>
      <WsFlex
        flexWrap={'wrap'}
      >
        {items.map((item, index) => (
          <View
            key={item.label}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {item.type === 'number' && (
              <>
                {index === 0 && (
                  <WsText
                    style={{
                      marginRight: 4
                    }}
                  >{t('每')}</WsText>
                )}
                <WsState
                  stateStyle={
                    [
                      {
                        minWidth: 100,
                        maxWidth: 100,
                        marginRight: 4,
                      },
                      isError
                        ? {
                          borderWidth: 1,
                          borderRadius: 10,
                          borderColor: borderColorError,
                          backgroundColor: backgroundColorError
                        }
                        : null,
                    ]}
                  label={''}
                  type={item.type}
                  maxLength={3}
                  rules={item.rules}
                  onChange={(e) => {
                    if (item.name === 'years' && e !== '') {

                      let _data = {
                        ...value,
                        years: e
                      }
                      $_handlePress(_data)
                    } else if (item.name === 'hours' && e !== '') {
                      let _data = {
                        ...value,
                        hours: e
                      }
                      $_handlePress(_data)
                    } else {
                      $_handlePress(undefined)
                    }
                  }}
                  value={value && item.name && value[item.name] != undefined ? value[item.name].toString() : ''}
                />
                <WsText
                  style={{
                    marginRight: 16
                  }}
                >{item.label}</WsText>
              </>
            )}
          </View>
        ))}
      </WsFlex>
    </>
  );
};

export default LlStateMultiNumberInput;
