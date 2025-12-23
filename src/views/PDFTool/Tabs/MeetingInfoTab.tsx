import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native'
import moment from 'moment'
import Clipboard from '@react-native-clipboard/clipboard'
import { useTranslation } from 'react-i18next'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsFlex,
  WsCard,
  WsIcon,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'

export type EsGoalVariable = {
  id: string
  customName: string
  variableName: string
  esGoalField: string
}

type Props = {
  variableList?: EsGoalVariable[]
}

const EsGoalVariableItem: React.FC<{ item: EsGoalVariable }> = ({ item }) => {
  const { t } = useTranslation()

  const onCopy = async () => {
    // 你要複製的是 ${xxx} 的話，這裡就照 ${...} 複製
    Clipboard.setString(`\${${item.variableName}}`)
    Alert.alert(t('已成功複製'))
  }

  return (
    <TouchableOpacity activeOpacity={0.9} style={{ marginHorizontal: 16, marginTop: 12 }}>
      <WsCard
        borderRadius={12}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: $color.gray,
        }}
      >
        <WsFlex alignItems="center" justifyContent="space-between">
          <WsText size={14}>{item.customName || t('使用者自定名稱')}</WsText>
        </WsFlex>

        <View style={{ marginTop: 8 }}>
          <WsFlex style={{ marginBottom: 8 }} alignItems="center">
            <WsText size={14} style={{ width: 160 }}>
              {t('變數')}
            </WsText>

            <WsText size={14}>{`\${${item.variableName}}`}</WsText>

            <TouchableOpacity style={{ marginLeft: 8 }} onPress={onCopy}>
              <WsIcon name="md-content-copy" size={28} color={$color.primary} />
            </TouchableOpacity>
          </WsFlex>

          <WsFlex alignItems="center">
            <WsText size={14} style={{ width: 160 }}>
              {t('對應ESGoal欄位')}
            </WsText>
            <WsText size={14} numberOfLines={1}>
              {item.esGoalField}
            </WsText>
          </WsFlex>
        </View>
      </WsCard>
    </TouchableOpacity>
  )
}

const MeetingInfoTab: React.FC<Props> = ({ variableList = [] }) => {
  const { t } = useTranslation()

  return (
    <ScrollView style={{ flex: 1, backgroundColor: $color.white }}>
      <WsPaddingContainer
        padding={0}
        style={{
          paddingTop: 16,
          paddingBottom: 8,
          paddingHorizontal: 16,
          backgroundColor: $color.white,
        }}
      >
        <WsText size={24}>{t('使用者​自訂​議事標題')}</WsText>
      </WsPaddingContainer>

      <WsPaddingContainer
        padding={0}
        style={{
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 16,
          backgroundColor: $color.white,
        }}
      >
        <View style={{ marginTop: 8 }}>
          <WsInfo labelWidth={100} style={{ flexDirection: 'row', alignItems: 'center' }} label={t('主席')} value={t('陳曉琪')} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={100}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            label={t('時間')}
            value={t('一一四年十一月二十日（星期四）上午9時30分')}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo labelWidth={100} style={{ flexDirection: 'row', alignItems: 'center' }} label={t('地點')} value={t('富邦大樓')} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo type="filesAndImages" label={t('提案​單上​傳格式​範本​')} value={['123']} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo type="filesAndImages" label={t('議程​範本​')} value={['123']} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo type="filesAndImages" label={t('目錄​範本​')} value={['123']} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo type="filesAndImages" label={t('封面​範本​')} value={['123']} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo labelWidth={100} style={{ flexDirection: 'row', alignItems: 'center' }} label={t('項目符號')} value={t('第1案')} />
        </View>

        <View style={{ marginTop: 16, borderTopWidth: 1, paddingTop: 16 }}>
          <WsInfo labelWidth={100} style={{ flexDirection: 'row', alignItems: 'center' }} label={t('負責人')} value={t('王大明')} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo labelWidth={100} style={{ flexDirection: 'row', alignItems: 'center' }} label={t('期限')} value={moment().format('YYYY-MM-DD')} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo labelWidth={100} style={{ flexDirection: 'row', alignItems: 'center' }} label={t('人員')} type="users" valueFontSize={14} value={['陳​小​其', '王小會​']} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo labelWidth={100} style={{ flexDirection: 'row', alignItems: 'center' }} label={t('角色')} type="belongstomany" valueFontSize={14} value={['部​長​', '課長']} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo type="tags" value={[1, 2, 3]} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo labelWidth={100} value={'123'} label={t('備註')} style={{ flexDirection: 'row' }} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo type="filesAndImages" label={t('附件')} value={['321.docx']} />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo type="filesAndImages" label={t('簽到表')} value={['簽到表.pdf']} />
        </View>
      </WsPaddingContainer>

      <WsPaddingContainer padding={0} style={{ marginTop: 8, paddingBottom: 8, backgroundColor: $color.primary11l }}>
        <FlatList
          data={variableList}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <EsGoalVariableItem item={item} />}
          ListHeaderComponent={() => (
            <>
              <WsPaddingContainer
                padding={0}
                style={{
                  paddingTop: 16,
                  paddingBottom: 16,
                  paddingHorizontal: 16,
                  backgroundColor: $color.primary11l,
                }}
              >
                <WsInfo
                  label={t('提案單範本')}
                  type="filesAndImages"
                  value={[
                    {
                      file: {
                        file_type: 'docx',
                        id: '2e4c7393-8690-4ac7-a277-004f1ffa1b21',
                        is_invalid: 0,
                        name: '提案單格式',
                        source_url: '',
                        version_number: 1,
                      },
                      file_version: null,
                    },
                  ]}
                />

                <View style={{ marginTop: 0 }}>
                  <WsInfo type="tags" value={[1, 2, 3]} />
                </View>
              </WsPaddingContainer>

              <WsPaddingContainer padding={0} style={{ paddingTop: 8, paddingHorizontal: 16 }}>
                <WsText size={14} fontWeight={500}>
                  {t('範本變數')}
                </WsText>
              </WsPaddingContainer>
            </>
          )}
          ListFooterComponent={() => <View style={{ height: 50 }} />}
        />
      </WsPaddingContainer>
    </ScrollView>
  )
}

export default MeetingInfoTab
