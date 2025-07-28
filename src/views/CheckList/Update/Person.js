// import React from 'react'
// import {
//   WsBtn,
//   WsStateFormView,
// } from '@/components'
// import { useTranslation } from 'react-i18next'

// const CheckListRecordShow = ({ navigation }) => {
//   const { t, i18n } = useTranslation();
//   const [isSubmitable, setIsSubmitable] = React.useState(false)

//   const fields = {

//     contactPerson: {
//       type: 'text',
//       label: t('聯絡人姓名'),
//       hasMarginTop: false,
//       autoFocus: true,
//       rules: 'required',
//       defaultValue: '11'
//     },
//     // writer: {
//     //   type: 'picker',
//     //   label: '填表人員',
//     //   rules: 'required',
//     //   items: [
//     //     { label: '林芳芳', value: '王大明' },
//     //     { label: 'Email', value: 'email' },
//     //   ],
//     // },
//     // checkPerson: {
//     //   type: 'picker',
//     //   label: '覆核人員',
//     //   rules: 'required',
//     //   items: [
//     //     { label: '手機', value: 'mobile' },
//     //     { label: 'Email', value: 'email' },
//     //   ],
//     // },
//     // mobile: {
//     //   type: 'tel',
//     //   label: '頻率',
//     //   placeholder: "每月",
//     //   displayCheck(fieldsValue) {
//     //     if (fieldsValue.contactWay == 'mobile') {
//     //       return true
//     //     } else {
//     //       return false
//     //     }
//     //   }
//     // },
//     // date: {
//     //   type: 'picker',
//     //   label: '設定期限',
//     //   rules: 'required',
//     //   items: [
//     //     { label: '15', value: '15' },
//     //     { label: '20', value: '20' },
//     //   ],
//     // },
//   }

//   const $_onHeaderRightPress = () => {
//   }

//   const $_setNavigationOption = () => {
//     navigation.setOptions({
//       headerRight: () => {
//         return (
//           <>
//             <WsBtn
//               isDisabled={!isSubmitable}
//               onPress={() => {
//                 $_onHeaderRightPress()
//               }}
//             >{t('儲存')}</WsBtn>
//           </>
//         )
//       },
//     })
//   }

//   React.useEffect(() => {
//     $_setNavigationOption()
//   }, [isSubmitable])

//   return (
//     <WsStateFormView
//       isSubmitable={isSubmitable}
//       setIsSubmitable={setIsSubmitable}
//       navigation={navigation}
//       fields={fields}
//     />
//     // <WsText></WsText>
//   )
// }

// export default CheckListRecordShow
