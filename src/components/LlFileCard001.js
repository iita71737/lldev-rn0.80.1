import React, { useState, useMemo } from 'react'
import {
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity,
  Platform
} from 'react-native'
import {
  WsFlex,
  LlBtn002,
  LlEventCard001,
  WsPage,
  LlEventHeaderNumCard,
  WsGrid,
  WsText,
  WsDes,
  WsCard,
  WsIconBtn,
  WsInfo
} from '@/components'
import S_EventType from '@/services/api/v1/event_type'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import CheckBox from '@react-native-community/checkbox'

const LlFileCard001 = (props) => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  const {
    item,
    onPress,
    checked,
    testID
  } = props

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const {
      folder_path,
      folder_uuid_path,
      file_path,
      file_uuid_path
    } = item;
    const folders = folder_path ? folder_path.split('/').slice(0, -1) : [];
    const folders_uuids = folder_uuid_path ? folder_uuid_path.split('/').slice(0, -1) : [];
    const files = file_path ? file_path.split('/').slice(0, -1) : [];
    const file_uuids = file_uuid_path ? file_uuid_path.split('/').slice(0, -1) : [];
    if ((folders.length !== folders_uuids.length) || (files.length !== file_uuids.length)) {
      return [];
    }
    if (folders.length > 0) {
      return folders.map((folder, index) => ({
        name: folder,
        uuid: folders_uuids[index],
      }));
    } else if (files.length > 0) {
      return files.map((file, index) => ({
        name: file,
        uuid: file_uuids[index],
      }));
    }
    return [];
  }, [item.folder_path, item.folder_uuid_path, item.file_path, item.file_uuid_path]);

  return (
    <TouchableOpacity
      testID={testID}
      style={{
        paddingBottom: 8,
      }}
      onPress={onPress}
    >
      <WsCard
        style={[
          {
            zIndex: 999
          }
        ]}
        color={checked ? $color.primary11l : $color.white}
      >
        <CheckBox
          boxType={'square'}
          animationDuration={0}
          disabled={false}
          style={{
            width: 20,
            height: 20,
            marginRight: 16,
            zIndex: 999
          }}
          value={checked}
          onValueChange={newValue => {
            if (Platform.OS === 'android') {
              onPress()
            } else {
              item.checked = newValue
            }
          }}
        />

        <View
          style={{
            flexDirection: 'column',
            flexWrap: 'nowrap',
            justifyContent: 'center',
            alignItems: 'flex-start',
            marginBottom: 4
          }}>
          {item && item.name && (
            <WsText
              style={{
                marginTop: 8
              }}>
              {t(item.name) ? t(item.name) : item.name}
            </WsText>
          )}
        </View>

        {breadcrumbs && (
          <WsFlex
            style={{
            }}
          >
            <WsText
              size={12}
              fontWeight={300}
              style={{
                marginRight: 16,
                width: 70
              }}
            >
              {t('路徑')}
            </WsText>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                maxWidth: width * 0.7,
              }}
            >
              <TouchableOpacity
                disabled={true}
              >
                <WsText color={$color.black} size={12}>{'最上層'}</WsText>
              </TouchableOpacity>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.uuid || index}>
                  <WsText color={$color.black}>{' / '}</WsText>
                  <TouchableOpacity
                    disabled={true}
                    onPress={() => {
                    }}
                  >
                    <WsText color={$color.black} size={12}>{crumb.name}</WsText>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </WsFlex>
        )}

        {item.version_number && (
          <WsInfo
            labelWidth={75}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            value={item.version_number}
            label={t('版本')}
            labelSize={12}
            labelFontWeight={300}
          />
        )}

        <WsInfo
          labelWidth={75}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
          labelSize={12}
          labelFontWeight={300}
          label={t('建立時間')}
          value={moment(item.created_at).format('YYYY-MM-DD HH:mm')}
          type="dateTime"
        />

        <WsInfo
          labelWidth={75}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
          labelSize={12}
          labelFontWeight={300}
          label={t('更新時間')}
          value={moment(item.created_at).format('YYYY-MM-DD HH:mm')}
          type="dateTime"
        />

      </WsCard>
    </TouchableOpacity>
  )
}

export default LlFileCard001