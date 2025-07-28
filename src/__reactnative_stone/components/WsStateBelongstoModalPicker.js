import React from 'react'
import {
  Pressable,
  Platform,
  TouchableHighlight,
  TouchableOpacity,
  Dimensions,
  View
} from 'react-native'
import {
  WsModal,
  WsInfiniteScroll,
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsCard,
  WsBtnSelect,
  WsIcon,
  WsTag,
  LlBtn002,
  WsState
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Services from '@/services/api/v1/index'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'

const WsStatebelongstoModalPicker = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    label,
    pressText = t('選取'),
    placeholder = `${t('選擇')}`,
    value,
    modelName,
    onChange,
    nameKey,
    nameKey2,
    formatNameKey2 = 'YYYY-MM-DD',
    onPress,
    params,
    hasMeta = true,
    getAll = hasMeta ? false : true,
    editable = true,
    formatNameKey,
    pickerStyle,
    isError,
    borderColorError = $color.danger,
    renderCom,
    preText,
    serviceIndexKey,
    testID,
    renderCustomizedCom,
    rules,
    suffixText,
    customizedNameKey = null
  } = props

  const FlatListRenderCom = renderCom
  const _renderCustomizedCom = renderCustomizedCom

  // States
  const [stateModal, setStateModal] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState()

  // Render
  return (
    <>
      {pickerStyle != 'picker' && (
        <>
          <TouchableOpacity
            testID={testID}
            onPress={() => {
              if (onPress) {
                onPress(navigation)
              } else {
                if (editable) {
                  setStateModal(true)
                }
              }
            }}>
            <WsPaddingContainer
              style={[
                {
                  borderWidth: 0.3,
                  borderRadius: 5,
                  backgroundColor: editable === false ? $color.white2d : $color.white
                },
                isError
                  ? {
                    borderWidth: 1,
                    borderColor: borderColorError,
                    backgroundColor: $color.danger11l
                  }
                  : null
              ]}>
              <WsFlex justifyContent="space-between">
                <WsFlex>
                  {modelName === 'user' && (
                    <WsIcon
                      style={{
                        marginRight: 8
                      }}
                      name="md-person"
                      size={20}
                      color={$color.gray}
                    />
                  )}
                  <WsText
                    style={{
                      marginTop: 0
                    }}
                    color={
                      value !== undefined && editable ? $color.black :
                        (isError && rules && rules.includes('required')) ? $color.danger :
                          $color.gray
                    }
                  >
                    {
                      `${preText ? t(preText) : ''} ${value ? formatNameKey ? moment(value[nameKey]).utc().local().format(formatNameKey) : t(value[nameKey]) : value !== undefined ? t('其他') : t(placeholder)} ${suffixText ? t(suffixText) : ''}`
                    }
                  </WsText>
                </WsFlex>
                <WsIcon
                  name="ws-outline-chevron-down"
                  size={24}
                  color={$color.gray}
                />
              </WsFlex>
            </WsPaddingContainer>
          </TouchableOpacity>
        </>
      )}
      {pickerStyle == 'picker' && (
        <>
          {label && (
            <WsText
              size={14}
              style={{
                margin: 8
              }}>
              {label}
            </WsText>
          )}
          <WsPaddingContainer
            style={[
              {
                borderWidth: 0.3,
                borderRadius: 10,
                backgroundColor: editable === false && $color.white2d,
              },
              isError
                ? {
                  borderWidth: 1,
                  borderColor: borderColorError,
                }
                : null
            ]}
            padding={0}>
            <WsBtnSelect
              style={{
                // borderWidth: 1,
              }}
              onPress={() => {
                setStateModal(true)
              }}
              text={
                value
                  ? formatNameKey
                    ? moment(value[nameKey]).format(formatNameKey)
                    : value[nameKey]
                  : t(placeholder)
              }
            />
          </WsPaddingContainer>
        </>
      )}
      <WsModal
        visible={stateModal}
        onBackButtonPress={() => {
          setStateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        animationType="slide"
      >
        {_renderCustomizedCom ? (
          <>
            <_renderCustomizedCom
              setParentStateModal={setStateModal}
              onPress={(item) => {
                onChange(item)
                setStateModal(false)
              }}
              onPressOthers={(item) => {
                const _item = {
                  name: '其他'
                }
                onChange(_item)
                setStateModal(false)
              }}
            ></_renderCustomizedCom>
          </>
        ) : (
          <WsInfiniteScroll
            hasMeta={hasMeta}
            getAll={getAll}
            service={Services[modelName]}
            serviceIndexKey={serviceIndexKey}
            params={
              searchValue ? {
                ...params,
                search: searchValue
              } : {
                ...params,
              }
            }
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  testID={item.name}
                  onPress={() => {
                    onChange(item)
                    setStateModal(false)
                  }}>
                  <WsCard
                    style={[
                      index != 0 ?
                        {
                          marginTop: 8
                        } :
                        null,
                      {
                        flexDirection: 'row'
                      }
                    ]}>
                    <WsFlex
                      style={{
                        flex: 1
                      }}
                      flexWrap={'wrap'}
                      justifyContent={formatNameKey2 ? 'space-between' : 'flex-start'}
                    >
                      <WsText
                        color={value?.id === item.id ? $color.primary : $color.black}
                        style={[
                          formatNameKey2 && customizedNameKey == null ?
                            {
                              maxWidth: width * 0.6
                            } : null
                        ]}
                      >
                        {preText ? t(preText) : ''}
                        {
                          formatNameKey
                            ? moment(item[nameKey]).format(formatNameKey)
                            : customizedNameKey == null
                              ? t(item?.[nameKey] || '')
                              : ''
                        }
                        {customizedNameKey === 'ApprovalPerson' ?
                          `${t(item?.last_version?.taker?.name)} - ${t(item?.name)} - ${t(item?.last_version?.license_number)}` :
                          ''
                        }
                        {customizedNameKey === 'userAndEmail' ?
                          `${item?.[nameKey]} ( ${item?.['email']} )` :
                          ''
                        }
                        {item?.is_released === 0 ? `(${t('未發布')})` : ''}
                      </WsText>
                      {nameKey2 && (
                        <WsText
                          size={12}
                        >
                          {formatNameKey2 ? moment(t(item[nameKey2])).format(formatNameKey2) : t(item[nameKey2])}
                        </WsText>
                      )}
                    </WsFlex>
                    {FlatListRenderCom && (
                      <FlatListRenderCom {...item} />
                    )}
                  </WsCard>
                </TouchableOpacity>
              )
            }}
            ListHeaderComponent={() => {
              return (
                <>
                  <View
                    style={{
                      alignItems: 'center',
                      marginVertical: 8,
                      marginHorizontal: 8,
                    }}>
                    <WsState
                      type="search"
                      stateStyle={{
                        backgroundColor: $color.white,
                        width: width * 0.95,
                        borderRadius: 10
                      }}
                      value={searchValue}
                      onChange={(e) => {
                        setSearchValue(e)
                      }}
                    />
                  </View>
                </>
              )
            }}
            ListFooterComponent={() => {
              return (
                <>
                  <View
                    style={{
                      height: 100,
                    }}
                  >
                  </View>
                </>

              )
            }}
            emptyTitle={t('沒有資料')}
          />
        )}
      </WsModal>
    </>
  )
}
export default WsStatebelongstoModalPicker
