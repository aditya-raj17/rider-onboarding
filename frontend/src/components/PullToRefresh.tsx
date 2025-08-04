import React from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
    children: React.ReactNode
    onRefresh: () => void | Promise<void>
    threshold?: number
    resistance?: number
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
    children,
    onRefresh,
    threshold = 80,
    resistance = 2.5
}) => {
    const [isRefreshing, setIsRefreshing] = React.useState(false)
    const [pullDistance, setPullDistance] = React.useState(0)
    const startY = React.useRef<number>(0)
    const currentY = React.useRef<number>(0)
    const isPulling = React.useRef<boolean>(false)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const isAtTop = React.useRef<boolean>(true)

    React.useEffect(() => {
        const container = containerRef.current
        if (!container) return

            const handleScroll = () => {
      isAtTop.current = container.scrollTop <= 5
    }

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if we're at the top of the scroll (with small buffer)
      if (isAtTop.current) {
        startY.current = e.touches[0].clientY
        isPulling.current = true
      }
    }

        const handleTouchMove = (e: TouchEvent) => {
            if (!isPulling.current) return

            currentY.current = e.touches[0].clientY
            const distance = currentY.current - startY.current

                  // Only prevent default and show pull indicator if we're pulling down AND at the top
      if (distance > 0 && isAtTop.current) {
        e.preventDefault()
        const pullDistance = Math.min(distance / resistance, threshold * 1.5)
        setPullDistance(pullDistance)
      } else if (distance <= 0 || !isAtTop.current) {
        // If user is scrolling up or not at top, reset pull state
        isPulling.current = false
        setPullDistance(0)
      }
        }

        const handleTouchEnd = async () => {
            if (!isPulling.current) return

                  // Only trigger refresh if we're at the top and pulled enough
      if (pullDistance >= threshold && !isRefreshing && isAtTop.current) {
                setIsRefreshing(true)
                setPullDistance(0)

                try {
                    await onRefresh()
                } catch (error) {
                    console.error('Pull to refresh failed:', error)
                } finally {
                    setIsRefreshing(false)
                }
            } else {
                setPullDistance(0)
            }

            isPulling.current = false
        }

            container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
    }, [onRefresh, threshold, resistance, pullDistance, isRefreshing])

    const showIndicator = pullDistance > 0 || isRefreshing
    const progress = Math.min((pullDistance / threshold) * 100, 100)

    return (
        <div
            ref={containerRef}
            style={{
                height: '100%',
                overflow: 'auto',
                position: 'relative',
                WebkitOverflowScrolling: 'touch' // Better scroll performance on iOS
            }}
        >
            {/* Pull to refresh indicator */}
            {showIndicator && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--surface-color)',
                    zIndex: 10,
                    transform: `translateY(${Math.min(pullDistance, 60)}px)`,
                    transition: isRefreshing ? 'none' : 'transform 0.2s ease-out'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem'
                    }}>
                        <RefreshCw
                            size={20}
                            style={{
                                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                                transform: `rotate(${progress * 3.6}deg)`
                            }}
                        />
                        <span>
                            {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
                        </span>
                    </div>
                </div>
            )}

            {/* Content */}
            <div style={{
                transform: showIndicator ? `translateY(${Math.min(pullDistance, 60)}px)` : 'translateY(0)',
                transition: isRefreshing ? 'none' : 'transform 0.2s ease-out'
            }}>
                {children}
            </div>
        </div>
    )
}

export default PullToRefresh 