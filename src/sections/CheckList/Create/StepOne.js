// import React, { useState, useEffect } from 'react'
// import { useNavigation } from '@react-navigation/native';
// import {
//   WsStateFormView,
//   WsPaddingContainer,
//   WsIcon,
//   WsText,
//   WsIconTitle,
//   WsFlex,
// } from '@/components'
// import S_CheckListTemplate from '@/services/api/v1/checklist_template'
// import ServiceCheckList from '@/services/api/v1/checklist'
// import i18next from 'i18next';

// const CheckListCreateStepOne = (props) => {
//   const {
//     id,
//   } = props

//   const navigation = useNavigation();

//   // State
//   const [isSubmitable, setIsSubmitable] = React.useState(false)
//   const [checkList, setCheckList] = useState({})
//   const [frequencyLabel, setFrequencyLabel] = useState('')
//   const [duePreText, setDuePreText] = useState(null)
//   const [remindMessage, setRemindMessage] = useState(null)

//   // Servieces
//   const getChecklistShow = async () => {
//     if (id) {
//       const res = await S_CheckListTemplate.show(id)
//       setCheckList(res)
//     }
//   }

//   // Data
//   const fields = {
//     contactPerson: {
//       type: 'text',
//       label: i18next.t('名稱'),
//       hasMarginTop: false,
//       autoFocus: true,
//       rules: 'required',
//       placeholder: i18next.t('請輸入點檢表名稱')
//     },
//     writer: {
//       type: 'belongsto',
//       label: i18next.t('答題者'),
//       nameKey: 'name',
//       modelName: 'user',
//       serviceIndexKey: 'factoryIndex',
//     },
//     frequency: {
//       type: 'picker',
//       label: i18next.t('頻率'),
//       editable: false,
//       items: [
//         { label: frequencyLabel, value: '1' }
//       ],
//     },
//     due: {
//       type: 'picker',
//       label: i18next.t('設定期限'),
//       rules: 'required',
//       preText: duePreText,
//       remind: i18next.t('到期限前一週還沒有收到任何點檢紀錄系統將會開設警示通知'),
//       placeholder: i18next.t('設定未填提醒'),
//       items: [
//         { label: '1天', value: '1' },
//         { label: '2天', value: '2' },
//         { label: '3天', value: '3' },
//         { label: '4天', value: '4' },
//         { label: '5天', value: '5' },
//         { label: '6天', value: '6' },
//         { label: '7天', value: '7' },
//         { label: '8天', value: '8' },
//         { label: '9天', value: '9' },
//         { label: '10天', value: '10' },
//         { label: '11天', value: '11' },
//         { label: '12天', value: '12' },
//         { label: '13天', value: '13' },
//         { label: '14天', value: '14' },
//         { label: '15天', value: '15' },
//         { label: '16天', value: '16' },
//         { label: '17天', value: '17' },
//         { label: '18天', value: '18' },
//         { label: '19天', value: '19' },
//         { label: '20天', value: '20' },
//       ],
//     },
//   }

//   // Function
//   const $_onPickPress = () => {
//     navigation.navigate('CheckListPickTemplate')
//   }
//   const getFrequencyLabel = () => {
//     switch (checkList.frequency) {
//       case 'day':
//         setFrequencyLabel(i18next.t('每日'))
//         setRemindMessage(i18next.t('到期限前還沒有收到任何點檢紀錄，系統將會開設警示通知。'))
//       case 'week':
//         setFrequencyLabel(i18next.t('每週'))
//         setDuePreText(i18next.t('每週'))
//         setRemindMessage(i18next.t('若屆每週提醒日尚未收到任何填寫紀錄，系統將發出提醒通知。'))
//       case 'month':
//         setFrequencyLabel(i18next.t('每月'))
//         setDuePreText(i18next.t('每月底的前'))
//         setRemindMessage(i18next.t('若屆每月提醒日尚未收到任何填寫紀錄，系統將發出提醒通知。'))
//       case 'senson':
//         setFrequencyLabel(i18next.t('每季'))
//         setDuePreText(i18next.t('每季底的前'))
//         setRemindMessage(i18next.t('若屆每季提醒日尚未收到任何填寫紀錄，系統將發出提醒通知。'))
//       default: ''
//     }
//   }


//   useEffect(() => {
//     getChecklistShow()
//   }, [])
//   useEffect(() => {
//     getFrequencyLabel()
//   }, [checkList])

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

// export default CheckListCreateStepOne