import config from '@/__config'
import messages from '@/__reactnative_stone/messages'

const _lang = config.app.lang ? config.app.lang : 'zh_tw'

export default messages[_lang]
