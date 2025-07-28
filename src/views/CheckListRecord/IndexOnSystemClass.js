import React from 'react'
import { Pressable, ScrollView, Image, View, Dimensions } from 'react-native'
import {
  WsText,
  WsFlex,
  WsDialog,
  WsPaddingContainer,
  LlCheckListResultCard,

  WsTag,
  WsSkeleton,
  WsPopup,
  WsGradientButton,
  WsInfiniteScroll
} from '@/components'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_ChecklistAssignment from '@/services/api/v1/checklist_assignment'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import i18next from 'i18next'
import S_ConstantData from '@/services/api/v1/constant_data'

const CheckListItemRecord = ({ route, navigation }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Params
  const {
    frequency,
    startTime,
    endTime,
    date,
    title,
    systemClass,
    item
  } = route.params

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // State
  const [paramsUndo, setParamsUndo] = React.useState({
    time_field: 'record_at',
    start_time: startTime ? startTime : undefined,
    end_time: endTime ? endTime : undefined,
    status: 1,
    system_classes: systemClass && systemClass.id ? systemClass.id : undefined
  })
  const [params, setParams] = React.useState({
    order_by: 'record_at',
    order_way: 'desc',
    time_field: 'record_at',
    start_time: startTime ? startTime : undefined,
    end_time: endTime ? endTime : undefined,
    system_classes: systemClass && systemClass.id ? systemClass.id : undefined,
  })

  // const [popupActive, setPopupActive] = React.useState(false)
  const [unRecordId, setUnRecordId] = React.useState()
  const [constantData, setConstantData] = React.useState()

  // Services
  const $_fetchConstantData = async () => {
    try {
      const _params = {
        model: 'checklist',
        type: 'result'
      }
      const res = await S_ConstantData.index({
        params: _params
      })
      if (res && res.data) {
        setConstantData(res.data)
      }
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    $_fetchConstantData()
  }, [])

  return (
    <>
      <ScrollView>
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
            marginBottom: 8
          }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap'
            }}>
            <WsText size={24}>{t('點檢記錄')}-</WsText>
            {item.ststem_class && (
              <WsTag
                backgroundColor={$color.white}
                iconSize={24}
                img={item.ststem_class.icon}
              />
            )}
            <WsText size={24}>{t(item.ststem_class.name)}</WsText>
          </View>
        </WsPaddingContainer>
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white
          }}>
          <WsFlex
            flexWrap={'wrap'}
          >
            <WsText size={14} fontWeight="bold"
              style={{
                marginRight: 16,
              }}>
              {t('記錄期間')}
            </WsText>
            <WsText size={16}>{item.date}</WsText>
          </WsFlex>
        </WsPaddingContainer>
        <>
          <WsPaddingContainer>
            <WsText size={16} color={$color.gray}>
              {t('共{number}份記錄', { number: item.record_count })}
            </WsText>
          </WsPaddingContainer>
          <WsInfiniteScroll
            service={S_CheckListRecord}
            serviceIndexKey="factoryIndex"
            params={params}
            hasMeta={true}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => {
              if (item.record_at)
                return (
                  <>
                    <LlCheckListResultCard
                      testID={`LlCheckListResultCard-${index}`}
                      constantData={constantData}
                      item={item}
                      id={item.id}
                      risk={item.risk_level}
                      title={item.name}
                      btnText={i18next.t('查看結果')}
                      passRate={item.pass_rate}
                      date={moment(item.record_at).format('YYYY-MM-DD')}
                      reviewers={item.reviewers ? item.reviewers : i18next.t('無')}
                      style={[
                        index == 0
                          ? {
                            marginTop: 0
                          }
                          : {

                          }
                      ]}
                      onPress={() => {
                        navigation.navigate({
                          name: 'CheckListAssignmentShow',
                          params: {
                            id: item.id
                          }
                        })
                      }}
                    />
                  </>
                )
            }}
          />

          <WsPaddingContainer>
            <WsText size={16} color={$color.gray}>
              {t('共{number}筆未填', { number: item.incomplete_assignments_count })}
            </WsText>
          </WsPaddingContainer>

          <WsInfiniteScroll
            service={S_ChecklistAssignment}
            serviceIndexKey="index"
            params={paramsUndo}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => {
              return (
                <>
                  <LlCheckListResultCard
                    constantData={constantData}
                    item={item}
                    id={item.id}
                    risk={item.risk_level}
                    undo={true}
                    title={item.checklist && item.checklist.name ? item.checklist.name : null}
                    passRate={item.pass_rate}
                    date={moment(item.record_at).format('YYYY-MM-DD')}
                    review={item.reviewer ? item.reviewer.name : i18next.t('無')}
                    reviewerVisible={false}
                    style={[
                      index == 0
                        ? null
                        : {
                          marginTop: 12
                        }
                    ]}
                    disabled={true}
                    onPress={() => {
                    }}
                  />
                </>
              )
            }}
          />

        </>
      </ScrollView>

      {/* <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.3,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16,
          }}>
          <WsText style={{ marginBottom: 16 }} size={24} fontWeight={'600'}>{t('此點檢表尚無結果')}</WsText>
          <WsText style={{ marginBottom: 16 }}>{t('答題者尚未進行點檢作業，故無法呈現點檢結果。')}</WsText>
          <WsGradientButton
            style={{
              width: width * 0.85,
              position: 'absolute',
              bottom: 16,
            }}
            borderRadius={24}
            onPress={() => {
              navigation.navigate({
                name: 'CheckListShow',
                params: {
                  id: unRecordId
                }
              })
              setPopupActive(false)
            }}>
            {t('前往點檢表')}
          </WsGradientButton>

        </View>
      </WsPopup> */}
    </>
  )
}

export default CheckListItemRecord
