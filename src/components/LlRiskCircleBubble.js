import { View, Text } from 'react-native'
import React from 'react'

const LlRiskCircleBubble = props => {
  const { riskDegree, complianceRate, opacity } = props

  const setComplianceRate = complianceRate => {
    if (complianceRate) {
      if (complianceRate <= 19 && complianceRate >= 0) {
        return 58
      } else if (complianceRate <= 39 && complianceRate > 19) {
        return 46
      } else if (complianceRate <= 59 && complianceRate > 39) {
        return 34
      } else if (complianceRate <= 79 && complianceRate > 59) {
        return 22
      } else if (complianceRate <= 100 && complianceRate > 79) {
        return 16
      }
    }
  }

  return (
    <View
      style={{
        flex: 1,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        left: 0,
        top: 0,
        width: 58,
        height: 58,
        margin: 0,
        padding: 0,
        zIndex: -1
      }}>
      {riskDegree === 'high' && (
        <View
          style={{
            position: 'absolute',
            width: setComplianceRate(complianceRate),
            height: setComplianceRate(complianceRate),
            borderRadius: 50,
            backgroundColor: 'rgba(249,62,34, 1)',
            opacity: 0.35
          }}
        />
      )}
      {riskDegree === 'middle' && (
        <View
          style={{
            position: 'absolute',
            width: setComplianceRate(complianceRate),
            height: setComplianceRate(complianceRate),
            borderRadius: 50,
            backgroundColor: 'rgba(255,213,0, 1)',
            opacity: 0.4
          }}
        />
      )}
      {riskDegree === 'low' && (
        <View
          style={{
            position: 'absolute',
            width: setComplianceRate(complianceRate),
            height: setComplianceRate(complianceRate),
            borderRadius: 50,
            backgroundColor: 'rgba(45,165,239, 1)',
            opacity: 0.4
          }}
        />
      )}
      {riskDegree === 'qualified' && (
        <View
          style={{
            position: 'absolute',
            width: setComplianceRate(complianceRate),
            height: setComplianceRate(complianceRate),
            borderRadius: 50,
            backgroundColor: 'rgba(6,232,152, 1)',
            opacity: 0.4
          }}
        />
      )}
      {riskDegree === '' && (
        <View
          style={{
            position: 'absolute',
            width: setComplianceRate(complianceRate),
            height: setComplianceRate(complianceRate),
            borderRadius: 50,
            backgroundColor: 'rgba(6,232,152, 0.6)',
            opacity: 0.7
          }}
        />
      )}
    </View>
  )
}

export default LlRiskCircleBubble
