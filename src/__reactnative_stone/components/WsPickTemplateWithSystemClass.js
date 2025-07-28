import React from 'react'
import { View, FlatList, Pressable, TouchableOpacity, LogBox } from 'react-native'
import {
  WsText,
  WsFlex,
  WsFastImage,
  WsTag,
  LlTemplatesCard001,
  WsSkeleton
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import Services from '@/services/api/v1/index'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import { useTranslation } from 'react-i18next'

const WsPickTemplateWithSystemClass = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    modelName,
    parentId,
    name,
    params,
    onPress,
    renderItem,
    text = t('找不到想新增的{item}種類嗎', { item: name }),
    onPressText = t('點此新增其他{item}', { item: name })
  } = props

  const FlatListRenderCom = renderItem

  // Redux
  const systemClasses = useSelector(state => state.data.systemClasses)

  // State
  const [loading, setLoading] = React.useState(true)
  const [filtersTemplates, setFiltersTemplates] = React.useState([])

  // Services
  const $_fetchLicenseTemplate = async () => {
    const res = await Services[modelName].index({
      parentId: parentId,
      params: params
    })
    setFiltersTemplates(res.data)
    setLoading(false)
  }

  // Function
  const $_getTemplatesWithSystemClass = (filtersTemplates, systemClasses) => {
    if (filtersTemplates) {
      const templatesWithSystemClass =
        S_SystemClass.getTemplatesWithSystemClass(
          filtersTemplates,
          systemClasses
        )
      // 有篩選子領域的話
      if (params.system_subclasses) {
        const _subClasses = params.system_subclasses
        const _filteredTemplates = S_SystemClass.getFilteredTemplate(
          templatesWithSystemClass,
          _subClasses
        )
        return _filteredTemplates
      }
      return templatesWithSystemClass
    }
  }

  const $_isSystemClassHasTemplate = systemClass => {
    let hasTemplate = false
    systemClass.system_subclasses.forEach(systemsubclass => {
      const _templates = $_getTemplateWithSystemSubclass(systemsubclass)
      if (_templates.length != 0) {
        hasTemplate = true
      }
    })
    return hasTemplate
  }
  const $_getTemplateWithSystemSubclass = systemSubclass => {
    const _templates = filtersTemplates.filter(template => {
      let hasSystemSubclass = false
      template.system_subclasses.forEach(TemplateSystemSubclass => {
        if (TemplateSystemSubclass.id == systemSubclass.id) {
          hasSystemSubclass = true
        }
      })
      return hasSystemSubclass
    })
    return _templates
  }

  React.useEffect(() => {
    $_fetchLicenseTemplate()
  }, [params])

  // Render
  return (
    <>
      {loading ? (
        <WsSkeleton />
      ) : (
        <>
          {$_getTemplatesWithSystemClass(filtersTemplates, systemClasses) && (
            <>
              {$_getTemplatesWithSystemClass(filtersTemplates, systemClasses).map((systemClass, systemClassIndex) => {
                return (
                  <View key={systemClassIndex}>
                    <View
                      key={systemClassIndex}
                      style={[
                        systemClassIndex == 0
                          ? {
                            marginTop: 16
                          }
                          : {
                            marginTop: 24,
                          }
                      ]}>
                      <View
                        style={[
                          systemClassIndex > 0
                            ? {
                              marginTop: 16,
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'center',
                            }
                            : {
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'center'
                            },
                          {
                            // backgroundColor: $color.primary11l,
                          }
                        ]}>
                        {systemClass.icon && (
                          <WsTag
                            img={systemClass.icon}
                            imgSize={28}
                            backgroundColor={$color.white}
                          />
                        )}
                        {systemClass.name && (
                          <WsText size={16} fontWeight="700">
                            {t(systemClass.name)}
                          </WsText>
                        )}
                      </View>
                      {systemClass.system_subclasses.map((subClass, index) => {
                        return (
                          <View
                            key={index}
                            style={{
                              // borderWidth:2,
                            }}
                          >
                            <>
                              <WsFlex
                                style={[
                                  index != 0
                                    ? {
                                      marginTop: 16,
                                      backgroundColor: $color.primary11l,
                                      borderRadius: 10,
                                      padding: 8,
                                    }
                                    :
                                    {
                                      backgroundColor: $color.primary11l,
                                      borderRadius: 10,
                                      padding: 8,
                                    }
                                ]}>
                                <WsTag
                                  key={subClass.id}
                                  img={subClass.icon}
                                  style={{
                                    backgroundColor: $color.blue10,
                                    // borderWidth:1,
                                  }}
                                />
                                <WsText
                                  style={{
                                  }}
                                  size={18}>
                                  {t(subClass.name)}
                                </WsText>
                              </WsFlex>
                              {subClass.templates.length > 0 &&
                                subClass.templates.map((item, index) => {
                                  if (item.name !== "") {
                                    return (
                                      <FlatListRenderCom
                                        key={item.id || index}
                                        {...item}
                                      />
                                    )
                                  } else {
                                    return <LlTemplatesCard001
                                      fontColor={$color.gray}
                                      fontStyle={{
                                        paddingLeft: 28,
                                      }}
                                      style={{
                                        marginTop: 8,
                                        backgroundColor: $color.white9d,
                                      }}
                                      name={t('此領域尚無公版')}
                                    />
                                  }
                                })}
                              {subClass && subClass.templates.length == 0 && (
                                <>
                                  <LlTemplatesCard001
                                    fontColor={$color.gray}
                                    fontStyle={{
                                    }}
                                    style={{
                                      marginTop: 8,
                                    }}
                                    name={t('此領域尚無公版')}
                                  />
                                </>
                              )}
                            </>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                )
              })}
              <WsText
                size={14}
                style={{
                  marginVertical: 16
                }}>
                {text}
              </WsText>
              <TouchableOpacity onPress={onPress}>
                <WsText size={14} color={$color.primary}>
                  {onPressText}
                </WsText>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </>
  )
}

export default WsPickTemplateWithSystemClass
