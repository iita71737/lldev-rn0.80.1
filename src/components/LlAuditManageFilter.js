// import React from 'react'
// import { StyleSheet } from 'react-native'

// import {
//   WsBtn,
//   WsPaddingContainer,
//   WsTitle,
//   WsText,
//   WsFlex,
//   WsIcon,
//   WsGrid,
//   WsManageCard,
//   WsIconTitle,
//   WsItemCheck
// } from '@/components'
// import gColor from '@/__reactnative_stone/global/color'
// import { useTranslation } from 'react-i18next'

// const LlAuditManageFilter = props => {
//   const { t, i18n } = useTranslation()
//   const { filterItems } = props

//   return (
//     <>
//       <WsFlex style={styles.filterTitle}>
//         <WsText color={gColor.black} size="14">
//           {t('環境')}
//         </WsText>
//         <WsFlex>
//           <WsText color={gColor.primary} size="h6">
//             {t('全選')}
//           </WsText>
//           <WsText color={gColor.primary} size="h6" style={styles.divider}>
//             |
//           </WsText>
//           <WsText color={gColor.primary} size="h6">
//             {t('全取消')}
//           </WsText>
//         </WsFlex>
//       </WsFlex>

//       <WsItemCheck />
//       <WsItemCheck />
//       <WsItemCheck />
//       <WsItemCheck />

//       <WsFlex style={styles.filterTitle}>
//         <WsText color={gColor.black} size="h6">
//           {t('環境')}
//         </WsText>
//         <WsFlex>
//           <WsText color={gColor.primary} size="h6">
//             {t('全選')}
//           </WsText>
//           <WsText color={gColor.primary} size="h6" style={styles.divider}>
//             |
//           </WsText>
//           <WsText color={gColor.primary} size="h6">
//             {t('全取消')}
//           </WsText>
//         </WsFlex>
//       </WsFlex>

//       <WsItemCheck />
//       <WsItemCheck />
//       <WsItemCheck />
//       <WsItemCheck />
//     </>
//   )
// }

// const styles = StyleSheet.create({
//   filterTitle: {
//     flex: 1,
//     justifyContent: 'space-between',
//     paddingTop: 14
//   },
//   divider: {
//     paddingLeft: 16,
//     paddingRight: 16
//   }
// })

// export default LlAuditManageFilter
