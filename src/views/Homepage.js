import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    RefreshControl,
    Alert,
    Linking,
    Text
} from 'react-native'
import {
    WsNavButton,
} from '@/components'
import {
    WsGrid,
    WsText,
    WsPaddingContainer,
    WsIconBtn,
    WsBadgeButton,
    WsBadgeIconButton,
    WsToggleTabBar,
    WsBottomRoundContainer,
    WsGradientButton,
    WsSkeleton,
    WsImageBtn,
    WsDialog,
    WsState
} from '@/components'
import { useSelector } from 'react-redux'
import store from '@/store'
import $color from '@/__reactnative_stone/global/color'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { scopePermission, scopeSubscriptions } from '@/__reactnative_stone/global/permission'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'
import S_Announcement from '@/services/api/v1/announcement'
import S_Alliance from '@/services/api/v1/alliance'

const Homepage = () => {
    const { t, i18n } = useTranslation()
    const navigation = useNavigation()

    // Redux
    const currentFactory = useSelector(state => state.data.currentFactory)
    const currentUser = useSelector(state => state.data.currentUser)
    const currentUserScope = useSelector(state => state.data.userScopes)
    const currentViewMode = useSelector(state => state.data.currentViewMode)

    // States
    const [manageList, setManageList] = React.useState([])

    const [visible, setVisible] = React.useState(false)
    const [minorValueToggle, setMinorValueToggle] = React.useState()
    const [minorToggleBtn, setMinorToggleBtn] = React.useState([
        { label: t('新訊'), value: 'ViewAnnouncement', },
        { label: t('法規'), value: 'Act' },
        { label: t('快報'), value: 'ViewBroadCast' }
    ])

    // Function
    const $_initManageList = async () => {
        try {
            const res = await S_Alliance.index({})
            // console.log(res, 'res--')
            if (res && Array.isArray(res.data)) {
                const mapped = res.data.map((item) => ({
                    title: t(item.name), // 翻譯文字
                    // backgroundImg: getBackgroundByKey(item.key), // 根據 key 選背景圖
                    onPress: () => {
                        setVisible(true)
                    },
                    // permission:
                    //     scopePermission(`${item.key}-read`, currentUserScope) &&
                    //     (currentViewMode === 'organization'
                    //         ? scopeSubscriptions(currentOrganization, item.key)
                    //         : scopeSubscriptions(currentFactory, item.key)),
                }))
                setManageList(mapped)
            }
        } catch (e) {
            console.log(e, 'e')
        }
    }

    React.useEffect(() => {
        $_initManageList()
    }, [currentFactory])

    return (
        <>
            <SafeAreaView
                edges={['top']}
                style={{
                    flex: 1,
                }}
            >
                <WsPaddingContainer
                    padding={0}
                    style={{
                        backgroundColor: gColor.primary11l,
                        paddingHorizontal: 16,
                    }}>
                    <WsGrid
                        numColumns={1}
                        spacing={4}
                        keyExtractor={item => item.title}
                        data={manageList}
                        renderItem={({ item, itemIndex }) => (
                            <>
                                <WsImageBtn
                                    key={item.title}
                                    // backgroundImg={item.backgroundImg}
                                    title={item.title}
                                    style={{
                                        // height: 200
                                    }}
                                    icon={
                                        (item.permission === false || item && item.permission === null) ? 'ws-outline-lock' : null
                                    }
                                    LinearGradientColors={
                                        item.permission === false
                                            ? [
                                                'rgba(6, 34, 46, 1)',
                                                'rgba(0, 24, 57, .8)',
                                                'rgba(6, 34, 46, 1)'
                                            ]
                                            : undefined
                                    }
                                    disable={(item && item.permission === false || item && item.permission === null) ? true : false}
                                    onPress={
                                        item.permission === true ? item.onPress : () => { }
                                    }
                                />
                            </>
                        )}
                    />

                </WsPaddingContainer>

                <WsDialog
                    contentPadding={0}
                    contentHeight={{
                        flex: 1,
                    }}
                    contentWidth={{ flex: 1 }}
                    dialogVisible={visible}
                    setDialogVisible={() => {
                        setVisible(false)
                    }}
                >
                    <WsState
                        stateStyle={{
                            backgroundColor: 'rgba(242, 248, 253, 1)',
                            height: 64,
                            width: 295,
                            borderWidth: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.3)',
                            shadowOpacity: 0.7,
                            shadowOffset: {
                                width: 4,
                                height: 4
                            }
                        }}
                        type="toggleBtn"
                        items={minorToggleBtn}
                        value={minorValueToggle}
                        onChange={(item, itemIndex) => {
                            console.log(item, 'item--')
                            setMinorValueToggle(item)
                            if (item) {
                                navigation.navigate(item?.value)
                                setVisible(false)
                            }
                        }}
                    />
                </WsDialog>

            </SafeAreaView>
        </>
    )
}

export default Homepage