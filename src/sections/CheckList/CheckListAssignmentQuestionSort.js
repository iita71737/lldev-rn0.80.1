import React from 'react'
import { FlatList, View } from 'react-native'
import {
  WsText,
  LlCheckListResultAnswerCard001,
  WsSkeleton
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

const CHECKLIST_ASSIGNMENT_QUESTION_SORT_CACHE = new Map()

const CheckListAssignmentQuestionSort = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    id,
    versionId,
    answers: inputAnswers,
    disableSelfFetch = false
  } = props

  // State
  const cacheKey = React.useMemo(() => String(id ?? ''), [id])
  const [answers, setAnswers] = React.useState(() => {
    if (Array.isArray(inputAnswers)) return inputAnswers
    return CHECKLIST_ASSIGNMENT_QUESTION_SORT_CACHE.get(cacheKey)
  })
  const [loading, setLoading] = React.useState(
    () => !(Array.isArray(inputAnswers) || CHECKLIST_ASSIGNMENT_QUESTION_SORT_CACHE.has(cacheKey))
  )

  // Services
  const $_fetchAnswers = async () => {
    console.log(id, 'S_CheckListRecordAns.indexV2 ques-sort')
    const res = await S_CheckListRecordAns.indexV2({
      parentId: id
    })
    const _sortedAnswers = [...(res?.data || [])].sort((a, b) => {
      const seqA = a?.sequence
      const seqB = b?.sequence
      const numA = Number(seqA)
      const numB = Number(seqB)
      const hasNumA = Number.isFinite(numA)
      const hasNumB = Number.isFinite(numB)
      if (hasNumA && hasNumB) return numA - numB
      if (hasNumA) return -1
      if (hasNumB) return 1
      return String(seqA ?? '').localeCompare(String(seqB ?? ''), undefined, {
        numeric: true,
        sensitivity: 'base'
      })
    })
    setAnswers(_sortedAnswers)
    CHECKLIST_ASSIGNMENT_QUESTION_SORT_CACHE.set(cacheKey, _sortedAnswers)
  }

  React.useEffect(() => {
    if (Array.isArray(inputAnswers)) {
      setAnswers(inputAnswers)
      CHECKLIST_ASSIGNMENT_QUESTION_SORT_CACHE.set(cacheKey, inputAnswers)
      setLoading(false)
      return
    }
    if (disableSelfFetch) {
      setLoading(false)
      return
    }
    const cached = CHECKLIST_ASSIGNMENT_QUESTION_SORT_CACHE.get(cacheKey)
    if (cached) {
      setAnswers(cached)
      setLoading(false)
      return
    }
    setLoading(true)
    $_fetchAnswers().finally(() => {
      setLoading(false)
    })
  }, [id, cacheKey, inputAnswers, disableSelfFetch])

  const keyExtractor = React.useCallback((item, index) => item.id || String(index), [])

  const renderItem = React.useCallback(({ item, index }) => {
    return (
      <LlCheckListResultAnswerCard001
        key={item.id}
        onPress={() => {
          navigation.navigate({
            name: 'CheckListAssignmentProcedure',
            params: {
              id: id,
              versionId: versionId
            }
          })
        }}
        style={{
          marginTop: 8
        }}
        no={index + 1}
        answer={item}
        title={item.title}
        score={item.score}
      />
    )
  }, [id, navigation, versionId])

  return (
    <>
      {loading ? (
        <WsSkeleton />
      ) : answers ? (
        <>
          <WsText
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16
            }}
            fontWeight="bold">
            {i18next.t('題目')}
            {'（ '}
            {t('共{number}題', { number: answers.length })}
            {' ）'}
          </WsText>

          <FlatList
            testID='flatList'
            data={answers}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews={true}
            ListFooterComponent={
              () => {
                return (
                  <View
                    style={{
                      height: 50,
                      // borderWidth: 1,
                    }}
                  >
                  </View>
                )
              }
            }
          />
        </>
      ) : null}
    </>
  )
}

export default React.memo(CheckListAssignmentQuestionSort, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.versionId === nextProps.versionId &&
    prevProps.disableSelfFetch === nextProps.disableSelfFetch &&
    prevProps.answers === nextProps.answers
  )
})
