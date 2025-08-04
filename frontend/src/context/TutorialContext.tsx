import React, { createContext, useContext, useState, useEffect } from 'react'
import {
    Tutorial,
    ProgressData,
    TutorialContextType,
    TutorialProviderProps
} from '../types'

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export const useTutorial = (): TutorialContextType => {
    const context = useContext(TutorialContext)
    if (!context) {
        throw new Error('useTutorial must be used within a TutorialProvider')
    }
    return context
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children, phoneNumber }) => {
    const [tutorials, setTutorials] = useState<Tutorial[]>([])
    const [progress, setProgress] = useState<ProgressData>({})
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // Backend API URL
    const API_BASE_URL = 'http://localhost:5001/api'

    // Load tutorials
    useEffect(() => {
        if (phoneNumber) {
            loadTutorials()
            loadProgress()
        }
    }, [phoneNumber])

    const loadTutorials = async (): Promise<void> => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE_URL}/tutorials`)
            const result = await response.json()

            if (result.success) {
                setTutorials(result.data)
            } else {
                setError(result.error || 'Failed to load tutorials')
            }
        } catch (err) {
            setError('Failed to load tutorials')
            console.error('Error loading tutorials:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadProgress = async (): Promise<void> => {
        if (!phoneNumber) return

        try {
            const response = await fetch(`${API_BASE_URL}/progress/${phoneNumber}`)
            const result = await response.json()

            if (result.success) {
                setProgress(result.data)
            } else {
                console.error('Error loading progress:', result.error)
            }
        } catch (err) {
            console.error('Error loading progress:', err)
        }
    }

    const saveProgress = async (tutorialId: number, completed: boolean = true): Promise<boolean> => {
        if (!phoneNumber) return false

        try {
            const response = await fetch(`${API_BASE_URL}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber,
                    tutorialId,
                    completed,
                    completedAt: new Date().toISOString()
                })
            })

            const result = await response.json()

            if (result.success) {
                setProgress(result.data)
                return true
            } else {
                console.error('Error saving progress:', result.error)
                return false
            }
        } catch (err) {
            console.error('Error saving progress:', err)
            return false
        }
    }

    const markTrainingComplete = async (): Promise<boolean> => {
        if (!phoneNumber) return false

        try {
            const response = await fetch(`${API_BASE_URL}/training/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber,
                    completedAt: new Date().toISOString()
                })
            })

            const result = await response.json()

            if (result.success) {
                return true
            } else {
                console.error('Error marking training complete:', result.error)
                return false
            }
        } catch (err) {
            console.error('Error marking training complete:', err)
            return false
        }
    }

    const getCompletedCount = (): number => {
        return Object.values(progress).filter(p => p.completed).length
    }

    const getProgressPercentage = (): number => {
        if (tutorials.length === 0) return 0
        return Math.round((getCompletedCount() / tutorials.length) * 100)
    }

    const isTrainingComplete = (): boolean => {
        return getCompletedCount() === tutorials.length
    }

    const getCurrentTutorial = (): Tutorial | undefined => {
        const completedIds = Object.keys(progress).filter(id => progress[id].completed)
        const nextTutorial = tutorials.find(t => !completedIds.includes(t.id.toString()))
        return nextTutorial || tutorials[tutorials.length - 1]
    }

    const value: TutorialContextType = {
        tutorials,
        progress,
        loading,
        error,
        phoneNumber,
        saveProgress,
        markTrainingComplete,
        getCompletedCount,
        getProgressPercentage,
        isTrainingComplete,
        getCurrentTutorial,
        loadTutorials,
        loadProgress
    }

    return (
        <TutorialContext.Provider value={value}>
            {children}
        </TutorialContext.Provider>
    )
} 