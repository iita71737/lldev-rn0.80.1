import ServiceColor from '@/__reactnative_stone/services/app/color'
import config from '@/__config'

const color = {
  ...config.theme.color
}
const primary = config.theme.color.primary
  ? config.theme.color.primary
  : '#96b364'
const black = config.theme.color.black ? config.theme.color.black : '#000000'
const white = config.theme.color.white ? config.theme.color.white : '#ffffff'
const danger = config.theme.color.danger ? config.theme.color.danger : 'red'
const link = config.theme.color.link ? config.theme.color.link : '#14ffb5'
const primaryLights = ServiceColor.getColors(13, primary, '#ffffff')
const primaryDarks = ServiceColor.getColors(13, primary, '#000000')
const dangerLights = ServiceColor.getColors(13, danger, '#ffffff')
const dangerDarks = ServiceColor.getColors(13, danger, '#000000')
const whiteDarks = ServiceColor.getColors(25, '#ffffff', '#000000')

color.primary = primary
color.danger = danger
color.black = black
color.white = white
color.link = link
color.gray = whiteDarks[12]

for (let index = 1; index < 6; index++) {
  color[`white${index}d`] = whiteDarks[index]
}
for (let index = 6; index < 12; index++) {
  color[`gray${12 - index}l`] = whiteDarks[index]
}
for (let index = 13; index < 19; index++) {
  color[`gray${index - 12}d`] = whiteDarks[index]
}
for (let index = 24; index > 19; index--) {
  color[`black${25 - index}l`] = whiteDarks[index]
}

primaryLights.forEach((primaryLight, primaryLightIndex) => {
  if (primaryLightIndex == 0) {
    return
  }
  color[`primary${primaryLightIndex}l`] = primaryLight
})
primaryDarks.forEach((primaryDark, primaryDarkIndex) => {
  if (primaryDarkIndex == 0) {
    return
  }
  color[`primary${primaryDarkIndex}d`] = primaryDark
})
dangerLights.forEach((dangerLight, dangerLightIndex) => {
  if (dangerLightIndex == 0) {
    return
  }
  color[`danger${dangerLightIndex}l`] = dangerLight
})
dangerDarks.forEach((dangerDark, dangerDarkIndex) => {
  if (dangerDarkIndex == 0) {
    return
  }
  color[`danger${dangerDarkIndex}d`] = dangerDark
})

color.light = {
  WsPaddingContainer: {
    // backgroundColor: color.white
  },
  WsInfoLink: {
    color: color.link
  },
  WsModalHeader: {
    iconLeftColor: color.black
  },
  WsModalIconMessage: {
    iconColor: color.white,
    textColor: color.white
  }
}

export default color
