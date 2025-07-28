// import React from 'react'
// import { Pressable, View } from 'react-native'
// import {
//   WsText,
//   WsFlex,
//   WsTag,
//   WsIconBtn,
//   WsDes,
//   WsModal,
//   WsStateFormView
// } from '@/components'
// import $color from '@/__reactnative_stone/global/color'
// import { useTranslation } from 'react-i18next'

// const LlCustomTemplateCard = props => {
//   const { t, i18n } = useTranslation()
//   // Props
//   const {
//     navigation,
//     no,
//     title,
//     style,
//     onPress,
//     fields = {},
//     isFocus = false,
//     des = t('自訂題目'),
//     copyOnPress,
//     deleteOnPress,
//     value,
//     onSubmit
//   } = props
//   // State
//   const [stateModal, setStateModal] = React.useState(false)
//   const [fieldsValue, setFieldsValue] = React.useState()

//   return (
//     <>
//       <Pressable
//         onPress={() => {
//           setStateModal(true)
//         }}>
//         <WsFlex
//           alignItems="flex-start"
//           style={[
//             {
//               padding: 16,
//               backgroundColor: $color.white
//             },
//             style
//           ]}>
//           <WsFlex
//             style={{
//               width: 22,
//               marginRight: 8
//             }}
//             justifyContent="center">
//             <WsText fontWeight="bold" size={14} style={{}}>
//               {no}
//             </WsText>
//           </WsFlex>
//           <WsFlex
//             flexDirection="column"
//             alignItems="flex-start"
//             style={{
//               marginRight: 12,
//               flex: 1
//             }}>
//             <WsText fontWeight="bold" size={14}>
//               {title}
//             </WsText>
//             <WsDes
//               style={{
//                 marginVertical: 8
//               }}>
//               {des}
//             </WsDes>

//             {isFocus && <WsTag>{t('重點關注')}</WsTag>}
//           </WsFlex>
//           <WsFlex flexDirection="column" justifyContent="center">
//             <WsIconBtn
//               name="ws-outline-delete"
//               size={24}
//               underlayColor={$color.danger}
//               underlayColorPressIn={$color.danger9l}
//               padding={6}
//               color={$color.white}
//               onPress={deleteOnPress}
//             />
//             <WsIconBtn
//               name="ws-outline-copy"
//               size={24}
//               underlayColor={$color.primary8l}
//               underlayColorPressIn={$color.primary9l}
//               padding={6}
//               onPress={copyOnPress}
//               style={{ marginTop: 4 }}
//             />
//           </WsFlex>
//         </WsFlex>
//       </Pressable>
//       <WsModal
//         title={title}
//         visible={stateModal}
//         onBackButtonPress={() => {
//           setStateModal(false)
//         }}
//         headerLeftOnPress={() => {
//           setStateModal(false)
//         }}
//         headerRightOnPress={() => { }}
//         animationType="slide"
//         footerBtnRightText="送出"
//         footerBtnRightOnPress={() => {
//           onSubmit(fieldsValue)
//           setStateModal(false)
//         }}
//         footerBtnLeftText="取消"
//         footerBtnLeftOnPress={() => {
//           setStateModal(false)
//         }}>
//         <WsStateFormView
//           headerRightBtnText="下一步"
//           navigation={navigation}
//           fields={fields}
//           onChange={setFieldsValue}
//           initValue={value}
//         />
//       </WsModal>
//     </>
//   )
// }
// export default LlCustomTemplateCard
