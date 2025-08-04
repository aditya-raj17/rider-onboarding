import { useEffect, useRef, useState } from 'react'

interface UsePullToRefreshOptions {
    onRefresh: () => void | Promise<void>
    threshold?: number
    resistance?: number
}

export const usePullToRefresh = ({
    onRefresh,
    threshold = 80,
    resistance = 2.5
}: UsePullToRefreshOptions) => {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)
    const startY = useRef<number>(0)
    const currentY = useRef<number>(0)
    const isPulling = useRef<boolean>(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleTouchStart = (e: TouchEvent) => {
            // Only trigger if we're at the top of the scroll
            if (container.scrollTop <= 0) {
                startY.current = e.touches[0].clientY
                isPulling.current = true
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (!isPulling.current) return

            currentY.current = e.touches[0].clientY
            const distance = currentY.current - startY.current

            if (distance > 0) {
                e.preventDefault()
                const pullDistance = Math.min(distance / resistance, threshold * 1.5)
                setPullDistance(pullDistance)
            }
        }

        const handleTouchEnd = async () => {
            if (!isPulling.current) return

            if (pullDistance >= threshold && !isRefreshing) {
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

        container.addEventListener('touchstart', handleTouchStart, { passive: false })
        container.addEventListener('touchmove', handleTouchMove, { passive: false })
        container.addEventListener('touchend', handleTouchEnd, { passive: false })

        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
            container.removeEventListener('touchend', handleTouchEnd)
        }
    }, [onRefresh, threshold, resistance, pullDistance, isRefreshing])

    return {
        containerRef,
        isRefreshing,
        pullDistance,
        refreshIndicator: pullDistance > 0
    }
} 