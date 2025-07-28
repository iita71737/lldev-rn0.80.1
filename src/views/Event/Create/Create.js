// import React from 'react'
// import { WsStateFormView } from '@/components'
// // ლ(⁰⊖⁰ლ)
// import { useSelector } from 'react-redux'
// import { useTranslation } from 'react-i18next'

// const EventCreate = ({ navigation }) => {
//   const { t, i18n } = useTranslation()
//   // Redux
//   const actTypes = useSelector(state => state.data.actTypes.data)
//   // States
//   const [isSubmitable, setIsSubmitable] = React.useState(false)
//   const fields = {
//     eventName: {
//       type: 'text',
//       label: t('主旨'),
//       placeholder: t('輸入'),
//       remind: t('建議撰寫格式')
//     },
//     owner: {
//       type: 'picker',
//       label: t('負責人'),
//       items: [{ label: '王大明', value: '王大明' }]
//     },
//     des: {
//       type: 'text',
//       multiline: true,
//       label: '說明',
//       placeholder: '輸入'
//     },
//     system_class: {
//       type: 'picker',
//       label: '負責人',
//       items: [{ label: '王大明', value: '王大明' }]
//     }
//   }
//   return (
//     <>
//       <WsStateFormView
//         isSubmitable={isSubmitable}
//         setIsSubmitable={setIsSubmitable}
//         navigation={navigation}
//         fields={fields}
//       />
//     </>
//   )
// }

// export default EventCreate
