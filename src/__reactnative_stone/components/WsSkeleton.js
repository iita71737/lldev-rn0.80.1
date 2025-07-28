import React from 'react'
import { WsCard } from '@/components'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import $color from '@/__reactnative_stone/global/color'

const WsSkeleton = props => {
  // Props
  const { type = 'card' } = props

  // Render
  return (
    <>
      {type == 'card' && (
        <WsCard
          style={{
            marginTop: 16,
          }}
        >
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>

              <SkeletonPlaceholder.Item height={30} borderRadius={4} />

              <SkeletonPlaceholder.Item
                marginTop={6}
                width={200}
                height={30}
                borderRadius={4}
              />
              
              <SkeletonPlaceholder.Item marginTop={24} flexDirection="row">
                <SkeletonPlaceholder.Item
                  width={60}
                  height={20}
                  borderRadius={2}
                />
                <SkeletonPlaceholder.Item
                  marginLeft={10}
                  width={60}
                  height={20}
                  borderRadius={2}
                />
              </SkeletonPlaceholder.Item>

            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        </WsCard>
      )}
      {type == 'cardlist' && (
        <>
          {Array.apply(null, Array(5))
            .map((_, index) => index)
            .map(_ => (
              <WsCard
                key={_}
                style={{
                  marginBottom: 6,
                  marginTop: 16
                }}>
                <SkeletonPlaceholder>
                  <SkeletonPlaceholder.Item>
                    <SkeletonPlaceholder.Item height={30} borderRadius={4} />
                    <SkeletonPlaceholder.Item
                      marginTop={6}
                      width={200}
                      height={30}
                      borderRadius={4}
                    />
                    <SkeletonPlaceholder.Item
                      marginTop={24}
                      flexDirection="row">
                      <SkeletonPlaceholder.Item
                        width={60}
                        height={20}
                        borderRadius={2}
                      />
                      <SkeletonPlaceholder.Item
                        marginLeft={10}
                        width={60}
                        height={20}
                        borderRadius={2}
                      />
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              </WsCard>
            ))}
        </>
      )}
    </>
  )
}

export default WsSkeleton
