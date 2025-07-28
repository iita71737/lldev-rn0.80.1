import React from 'react'
import {
  Pressable,
  View,
  FlatList,
  TouchableOpacity
} from 'react-native'
import {
  WsText,
  WsIcon,
  WsCard,
  WsFlex,
  WsStateFormModal,
  WsTag
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { useSelector } from 'react-redux'

const WsStateModels = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    text = t('新增'),
    onChange,
    value = [],
    renderCom,
    fields,
    _dateCompare,
    testID,
    renderCom002,
    renderCom002Label,
    renderCom002Fields,
    renderCom002Remind,
    renderCom003,
    renderCom003Label,
    title,
    renderCom004Label,
    values
  } = props

  // REDUX
  const currentUser = useSelector(state => state.data.currentUser)

  // States
  const [editIndex, setEditIndex] = React.useState()
  const [editValue, setEditValue] = React.useState(value ? value : null)
  const [stateModal, setStateModal] = React.useState(false)
  const [stateModal002, setStateModal002] = React.useState(false)
  const FlatListRenderCom = renderCom
  const FlatListRenderCom002 = renderCom002
  const FlatListRenderCom003 = renderCom003
  const [mode, setMode] = React.useState('default')
  const [initialValue, setInitialValue] = React.useState()
  const [draggedValue, setDraggedVale] = React.useState()


  // Function
  const $_deleteOnPress = index => {
    const _value = [...value]
    _value.splice(index, 1)
    onChange(_value)
  }

  // Render
  return (
    <>
      <WsFlex
        justifyContent={'space-between'}
      >
        <WsFlex>
          {renderCom004Label && (
            <TouchableOpacity
              style={{
                alignItems: 'flex-end',
              }}
              onPress={() => {
                const _data = {
                  name: values?.name,
                  remark: values?.remark,
                  taker: currentUser,
                  expired_at: moment().format('YYYY-MM-DD'),
                }
                const _value = [...value]
                _value.unshift(_data)
                onChange(_value)
              }}
            >
              <WsTag
                style={{
                  flex: 1
                }}>
                {t(renderCom004Label)}
              </WsTag>
            </TouchableOpacity>
          )}
        </WsFlex>

        <WsFlex
          justifyContent='flex-end'
        >
          {FlatListRenderCom002 &&
            mode !== 'dragSort' && (
              <FlatListRenderCom002
                text={renderCom002Label}
                onPress={() => {
                  setStateModal002(true)
                }}
              ></FlatListRenderCom002>
            )}
          {FlatListRenderCom003 &&
            mode !== 'dragSort' ? (
            <FlatListRenderCom003
              text={renderCom003Label}
              onPress={() => {
                const _value = value
                if (mode !== 'dragSort') {
                  setInitialValue(value)
                  setDraggedVale(value)
                  onChange([])
                  setMode('dragSort')
                } else {
                  setMode('default')
                }
              }}
            ></FlatListRenderCom003>
          ) : FlatListRenderCom003 && (
            <WsFlex
              justifyContent='flex-end'
            >
              <FlatListRenderCom003
                text={t('取消')}
                onPress={() => {
                  onChange(initialValue)
                  setMode('default')
                }}
              ></FlatListRenderCom003>
              <FlatListRenderCom003
                text={t('儲存')}
                onPress={() => {
                  onChange(draggedValue)
                  setMode('default')
                }}
              ></FlatListRenderCom003>
            </WsFlex>
          )}
        </WsFlex>
      </WsFlex>

      {value &&
        value.length != 0 &&
        mode !== 'dragSort' && (
          <>
            {value.map((item, index) => {
              return (
                <View
                  key={`stateModel${index}`}
                >
                  <FlatListRenderCom
                    {...item}
                    _dateCompare={moment(_dateCompare).utc()}
                    fields={fields}
                    value={_dateCompare ? { ...item, task_expired_at: moment(_dateCompare).utc() } : item}
                    attachCount={item.attaches ? item.attaches.length : 0}
                    onChange={$event => {
                      let _value = [...value]
                      _value[index] = $event
                      onChange(_value)
                    }}
                    style={{
                      marginTop: 8,
                      borderWidth: 1,
                    }}
                    deleteOnPress={() => {
                      $_deleteOnPress(index)
                    }}
                    stateModal={stateModal}
                    onPress={() => {
                      const _value = [...value]
                      onChange(_value)
                      setEditIndex(index)
                      setEditValue(item)
                      setStateModal(true)
                    }}
                  />
                </View>
              )
            })}
          </>
        )}

      {draggedValue &&
        draggedValue.length != 0 &&
        mode === 'dragSort' && (
          <>
            <DraggableFlatList
              data={draggedValue}
              keyExtractor={(item) => item.id}
              renderItem={({ item, getIndex, drag, isActive }) => (
                <TouchableOpacity
                  style={[
                    {
                    },
                    // { backgroundColor: isActive ? "lightgray" : $color.white },
                  ]}
                  onPressIn={drag}
                  onLongPress={drag} // 長按開始拖動
                >
                  <WsCard
                    borderRadius={10}
                    style={{
                      backgroundColor: $color.primary10l,
                      marginTop: 8
                    }}>
                    <WsFlex
                      justifyContent='space-between'
                    >
                      <WsText>{`${getIndex() + 1}  ${item.name}`}</WsText>
                      <WsIcon
                        name="ws-outline-drag-horizontal"
                        size={24}
                        style={{
                          marginRight: 8
                        }}
                      />
                    </WsFlex>
                  </WsCard>
                </TouchableOpacity>
              )}
              onDragEnd={({ data }) => {
                setDraggedVale(data)
              }}
            />
          </>
        )}

      {mode !== 'dragSort' && (
        <TouchableOpacity
          testID={testID}
          onPress={() => {
            if (_dateCompare) {
              setEditValue({
                task_expired_at: moment(_dateCompare).utc()
              })
            }
            setEditValue(null)
            setStateModal(true)
          }}>
          <WsCard
            borderRadius={10}
            style={{
              backgroundColor: $color.primary10l,
              marginTop: 8
            }}>
            <WsFlex>
              <WsIcon
                name="md-add-circle"
                size={24}
                style={{
                  marginRight: 8
                }}
              />
              <WsText>{text}</WsText>
            </WsFlex>
          </WsCard>
        </TouchableOpacity>
      )}

      <WsStateFormModal
        title={title}
        visible={stateModal}
        fields={fields}
        footerBtnRightText={t('儲存')}
        onClose={() => {
          console.log('WsStateFormModal close');
          setStateModal(false)
        }}
        onSubmit={$event => {
          if (editValue && editIndex != undefined) {
            let _value = [...value]
            _value.splice(editIndex, 1, $event)
            onChange(_value)
            setStateModal(false)
          } else {
            const _value = [...value]
            _value.push($event)
            onChange(_value)
            setStateModal(false)
          }
        }}
        initValue={editValue}
      />

      <WsStateFormModal
        title={renderCom002Label}
        remind={renderCom002Remind}
        visible={stateModal002}
        fields={renderCom002Fields}
        onClose={() => {
          console.log('WsStateFormModal002 close');
          setStateModal002(false)
        }}
        onSubmit={$event => {
          if ($event) {
            let _value = [...value]
            const updatedValue = _value.map(item => ({
              ...item,
              ...$event
            }));
            console.log(updatedValue, 'updatedValue--');
            onChange(updatedValue)
            setStateModal002(false)
          }
        }}
      />
    </>
  )
}
export default WsStateModels
