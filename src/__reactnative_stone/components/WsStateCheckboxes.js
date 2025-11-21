import React from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native'
import { WsNavCheck } from '@/components'

const WsStateCheckboxes = props => {
  const {
    items = [],
    value = [],
    onChange,
    style,
    indent = 16,              // 每一層縮排
    showActions = true,       // 是否顯示「全選 / 全取消」
    selectAllLabel = '全選',
    clearAllLabel = '全取消',
  } = props

  // 取得某 item 是否被勾選
  const isChecked = (item) => {
    if (!Array.isArray(value)) return false
    return value.includes(item.id)
  }

  // 切換單一 id
  const toggleId = (checked, id) => {
    const next = Array.isArray(value) ? [...value] : []
    const idx = next.findIndex(e => e === id)

    if (checked) {
      if (idx < 0) next.push(id)
    } else {
      if (idx >= 0) next.splice(idx, 1)
    }

    onChange?.(next)
  }

  // 把巢狀 items 攤平成所有 id
  const flattenIds = (nodes) => {
    const result: string[] = []
    const walk = (arr) => {
      if (!Array.isArray(arr)) return
      arr.forEach(node => {
        if (node?.id) result.push(node.id)
        if (Array.isArray(node.items) && node.items.length > 0) {
          walk(node.items)
        }
      })
    }
    walk(nodes)
    // 去重
    return Array.from(new Set(result))
  }

  const handleSelectAll = () => {
    const allIds = flattenIds(items)
    onChange?.(allIds)
  }

  const handleClearAll = () => {
    onChange?.([])
  }

  // 遞迴渲染巢狀 items
  const renderItems = (nodes, level = 0) => {
    if (!Array.isArray(nodes)) return null

    return nodes.map((item, index) => {
      const key = item.id ?? `${level}-${index}`
      const checked = isChecked(item)
      const hasChildren = Array.isArray(item.items) && item.items.length > 0

      return (
        <View key={key}>
          <View style={{ marginLeft: level * indent }}>
            <WsNavCheck
              testID={item.name}
              value={checked}
              onChange={($event) => {
                // $event 為 boolean
                toggleId($event, item.id)
              }}
            >
              {item.name}
            </WsNavCheck>
          </View>

          {hasChildren && renderItems(item.items, level + 1)}
        </View>
      )
    })
  }

  return (
    <View style={style}>
      {showActions && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleSelectAll}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>{selectAllLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleClearAll}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>{clearAllLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView>{renderItems(items, 0)}</ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
})

export default WsStateCheckboxes
