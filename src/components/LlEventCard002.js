// import React, { useState } from 'react'
// import { View, Text, ScrollView, Image } from 'react-native'
// import { WsCard, WsText, WsIcon, WsFlex } from '@/components'
// import { useTranslation } from 'react-i18next'

// const LlEventCard002 = props => {
//   const { t, i18n } = useTranslation()

//   // Props
//   const { item } = props

//   return (
//     <View>
//       <WsCard
//         style={{
//           marginLeft: 16,
//           marginRight: 16,
//           marginTop: 16
//         }}>
//         <View
//           style={{
//             flexDirection: 'row',
//             flexWrap: 'nowrap',
//             justifyContent: 'space-between'
//           }}>
//           <WsText
//             style={{
//               fontSize: 16,
//               width: 240
//             }}>
//             {item.title}
//           </WsText>
//           {item.chip.text === '列管中' && (
//             <View
//               style={{
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 height: 26,
//                 width: 52,
//                 borderRadius: 8,
//                 backgroundColor: 'rgb(255,238,236)'
//               }}>
//               <Text style={{ color: 'rgb(221,78,65)', fontSize: 12 }}>
//                 {item.chip.text ? item.chip.text : ''}
//               </Text>
//             </View>
//           )}
//           {item.chip.text === '處理中' && (
//             <View
//               style={{
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 height: 26,
//                 width: 52,
//                 borderRadius: 8,
//                 backgroundColor: 'rgb(255,247,208)'
//               }}>
//               <Text style={{ color: 'rgb(55,55,55)', fontSize: 12 }}>
//                 {item.chip.text ? item.chip.text : ''}
//               </Text>
//             </View>
//           )}
//           {item.chip.text === '已核銷' && (
//             <View
//               style={{
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 height: 26,
//                 width: 52,
//                 borderRadius: 8,
//                 backgroundColor: 'rgb(226,226,226)'
//               }}>
//               <Text style={{ color: 'rgb(55,55,55)', fontSize: 12 }}>
//                 {item.chip.text ? item.chip.text : ''}
//               </Text>
//             </View>
//           )}
//         </View>

//         <View
//           style={{
//             flexDirection: 'row',
//             justifyContent: 'flex-start',
//             alignItems: 'center'
//           }}>
//           {item.categoryTag.map(r => (
//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 marginRight: 4,
//                 marginTop: 8,
//                 marginBottom: 8,
//                 padding: 4,
//                 backgroundColor: 'rgb(242,248,253)',
//                 borderRadius: 8,
//               }}>
//               {r === t('水污染防治') && (
//                 <View
//                   style={{
//                     padding: 4
//                   }}>
//                   <Image
//                     size={40}
//                     source={require('@/__reactnative_stone/assets/img/iconEshWater.png')}
//                   />
//                 </View>
//               )}
//               {r === t('空氣污染防治') && (
//                 <View
//                   style={{
//                     padding: 4
//                   }}>
//                   <Image
//                     size={40}
//                     source={require('@/__reactnative_stone/assets/img/iconEshAir.png')}
//                   />
//                 </View>
//               )}
//               <WsText
//                 style={{
//                   fontSize: 12,
//                   fontWeight: 'bold',
//                   color: 'rgb(5,133,211)',
//                   paddingRight: 4
//                 }}>
//                 {r}
//               </WsText>
//             </View>
//           ))}
//         </View>
//         <WsFlex>
//           <WsIcon size={18} name="ws-outline-time" />
//           <WsText
//             style={{
//               fontSize: 14,
//               color: 'rgb(128,128,128)',
//               position: 'relative',
//               bottom: 0
//             }}>
//             {t('發生時間')}
//             {item.date}
//           </WsText>
//         </WsFlex>
//       </WsCard>
//     </View>
//   )
// }

// export default LlEventCard002
