export interface Tutorial {
    id: number
    title: string
    description: string
    type: 'text' | 'video' | 'image' | 'quiz'
    content: string | QuizContent
    estimatedTime: string
    order: number
}

export interface QuizContent {
    questions: QuizQuestion[]
}

export interface QuizQuestion {
    id: number
    question: string
    options: string[]
    correctAnswer: number
}

export interface TutorialProgress {
    completed: boolean
    completedAt: string
}

export interface ProgressData {
    [tutorialId: string]: TutorialProgress
}

export interface TutorialContextType {
    tutorials: Tutorial[]
    progress: ProgressData
    loading: boolean
    error: string | null
    phoneNumber: string
    saveProgress: (tutorialId: number, completed?: boolean) => Promise<boolean>
    markTrainingComplete: () => Promise<boolean>
    getCompletedCount: () => number
    getProgressPercentage: () => number
    isTrainingComplete: () => boolean
    getCurrentTutorial: () => Tutorial | undefined
    loadTutorials: () => Promise<void>
    loadProgress: () => Promise<void>
}

export interface PhoneEntryProps {
    onSubmit: (phone: string) => void
}

export interface TutorialListProps {
    onLogout: () => void
}

export interface TutorialViewProps {
    onLogout: () => void
}



export interface TutorialProviderProps {
    children: React.ReactNode
    phoneNumber: string
} 