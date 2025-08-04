import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTutorial } from '../context/TutorialContext'
import { TutorialViewProps, Tutorial, QuizContent } from '../types'
import PullToRefresh from './PullToRefresh'
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    LogOut,
    Clock
} from 'lucide-react'

const TutorialView: React.FC<TutorialViewProps> = ({ onLogout }) => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const {
        tutorials,
        progress,
        phoneNumber,
        saveProgress,
        isTrainingComplete
    } = useTutorial()

    const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null)
    const [isCompleted, setIsCompleted] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [videoProgress, setVideoProgress] = useState<number>(0)

    const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
    const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false)
    const [quizScore, setQuizScore] = useState<number>(0)

    useEffect(() => {
        const tutorial = tutorials.find(t => t.id.toString() === id)
        if (tutorial) {
            setCurrentTutorial(tutorial)
            setIsCompleted(progress[tutorial.id]?.completed || false)
        }
    }, [id, tutorials, progress])

    const handleComplete = async (): Promise<void> => {
        if (!currentTutorial || isCompleted) return

        setIsSubmitting(true)

        try {
            const success = await saveProgress(currentTutorial.id, true)
            if (success) {
                setIsCompleted(true)

                // If this is the last tutorial, navigate to completion
                if (isTrainingComplete()) {
                    setTimeout(() => {
                        navigate('/completion')
                    }, 1500)
                }
            }
        } catch (error) {
            console.error('Error completing tutorial:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleVideoProgress = (e: React.SyntheticEvent<HTMLVideoElement>): void => {
        const video = e.currentTarget
        const progress = (video.currentTime / video.duration) * 100
        setVideoProgress(progress)

        // Auto-complete when video is 90% watched
        if (progress >= 90 && !isCompleted) {
            handleComplete()
        }
    }



    const handleQuizAnswer = (questionId: number, answerIndex: number): void => {
        setQuizAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }))
    }

    const handleQuizSubmit = (): void => {
        if (!currentTutorial || currentTutorial.type !== 'quiz') return

        const quizContent = currentTutorial.content as QuizContent
        const questions = quizContent.questions
        let correctAnswers = 0

        questions.forEach(question => {
            if (quizAnswers[question.id] === question.correctAnswer) {
                correctAnswers++
            }
        })

        const score = Math.round((correctAnswers / questions.length) * 100)
        setQuizScore(score)
        setQuizSubmitted(true)

        // Auto-complete if score is 80% or higher
        if (score >= 80) {
            setTimeout(() => {
                handleComplete()
            }, 2000)
        }
    }

    const getNextTutorial = (): Tutorial | undefined => {
        const currentIndex = tutorials.findIndex(t => t.id.toString() === id)
        return tutorials[currentIndex + 1]
    }

    const getPreviousTutorial = (): Tutorial | undefined => {
        const currentIndex = tutorials.findIndex(t => t.id.toString() === id)
        return tutorials[currentIndex - 1]
    }

    const handleNext = (): void => {
        const nextTutorial = getNextTutorial()
        if (nextTutorial) {
            navigate(`/tutorial/${nextTutorial.id}`)
        } else {
            navigate('/tutorials')
        }
    }

    const handlePrevious = (): void => {
        const prevTutorial = getPreviousTutorial()
        if (prevTutorial) {
            navigate(`/tutorial/${prevTutorial.id}`)
        } else {
            navigate('/tutorials')
        }
    }

    const handleRefresh = async (): Promise<void> => {
        // This will trigger a reload of the current tutorial
        window.location.reload()
    }

    if (!currentTutorial) {
        return (
            <div className="page-container">
                <div className="loading">
                    <div className="spinner"></div>
                    <p style={{ marginLeft: '1rem' }}>Loading tutorial...</p>
                </div>
            </div>
        )
    }

    const renderContent = () => {
        switch (currentTutorial.type) {
            case 'video':
                const videoUrl = currentTutorial.content as string
                const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')

                if (isYouTube) {
                    // Extract YouTube video ID
                    const getYouTubeVideoId = (url: string): string => {
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
                        const match = url.match(regExp)
                        return (match && match[2].length === 11) ? match[2] : ''
                    }

                    const videoId = getYouTubeVideoId(videoUrl)
                    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`

                    return (
                        <div className="tutorial-content">
                            <div style={{ position: 'relative' }}>
                                <iframe
                                    src={embedUrl}
                                    title={currentTutorial.title}
                                    style={{
                                        width: '100%',
                                        height: '315px',
                                        border: 'none',
                                        borderRadius: '0.5rem'
                                    }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    backgroundColor: 'var(--background-color)',
                                    borderRadius: '0.5rem',
                                    textAlign: 'center'
                                }}>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--text-secondary)',
                                        margin: 0
                                    }}>
                                        ⚠️ YouTube videos don't support automatic progress tracking.
                                        Please watch the entire video and mark as complete manually.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                } else {
                    // Regular video file
                    return (
                        <div className="tutorial-content">
                            <div style={{ position: 'relative' }}>
                                <video
                                    src={videoUrl}
                                    controls
                                    onTimeUpdate={handleVideoProgress}
                                    style={{ width: '100%', borderRadius: '0.5rem' }}
                                />
                                <div className="progress-bar" style={{ marginTop: '1rem' }}>
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${videoProgress}%` }}
                                    ></div>
                                </div>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)',
                                    marginTop: '0.5rem'
                                }}>
                                    {Math.round(videoProgress)}% watched
                                </p>
                            </div>
                        </div>
                    )
                }

            case 'image':
                return (
                    <div className="tutorial-content">
                        <img
                            src={currentTutorial.content as string}
                            alt={currentTutorial.title}
                            style={{ width: '100%', borderRadius: '0.5rem' }}
                        />
                    </div>
                )

            case 'quiz':
                const quizContent = currentTutorial.content as QuizContent
                return (
                    <div className="tutorial-content">
                        {!quizSubmitted ? (
                            <div>
                                {quizContent.questions.map((question, index) => (
                                    <div key={question.id} style={{ marginBottom: '2rem' }}>
                                        <h4 style={{
                                            fontSize: '1rem',
                                            fontWeight: '500',
                                            color: 'var(--text-primary)',
                                            marginBottom: '1rem'
                                        }}>
                                            {index + 1}. {question.question}
                                        </h4>
                                        <div>
                                            {question.options.map((option, optionIndex) => (
                                                <label
                                                    key={optionIndex}
                                                    style={{
                                                        display: 'block',
                                                        padding: '0.75rem',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '0.5rem',
                                                        marginBottom: '0.5rem',
                                                        cursor: 'pointer',
                                                        backgroundColor: quizAnswers[question.id] === optionIndex ? 'var(--primary-color)' : 'var(--surface-color)',
                                                        color: quizAnswers[question.id] === optionIndex ? 'white' : 'var(--text-primary)',
                                                        transition: 'all 0.2s ease-in-out'
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${question.id}`}
                                                        value={optionIndex}
                                                        checked={quizAnswers[question.id] === optionIndex}
                                                        onChange={() => handleQuizAnswer(question.id, optionIndex)}
                                                        style={{ marginRight: '0.5rem' }}
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={handleQuizSubmit}
                                    className="btn btn-primary"
                                    disabled={Object.keys(quizAnswers).length < quizContent.questions.length}
                                >
                                    Submit Quiz
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '3rem',
                                    fontWeight: 'bold',
                                    color: quizScore >= 80 ? 'var(--success-color)' : 'var(--error-color)',
                                    marginBottom: '1rem'
                                }}>
                                    {quizScore}%
                                </div>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {quizScore >= 80 ? 'Great job!' : 'Keep practicing!'}
                                </h3>
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    marginBottom: '1rem'
                                }}>
                                    {quizScore >= 80
                                        ? 'You passed the quiz and can continue to the next tutorial.'
                                        : 'You need to score at least 80% to pass. Please review the material and try again.'
                                    }
                                </p>
                                {quizScore >= 80 && (
                                    <div className="success-message">
                                        <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
                                        Tutorial completed successfully!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )

            default: // text
                return (
                    <div className="tutorial-content">
                        <div style={{
                            lineHeight: '1.7',
                            fontSize: '1rem',
                            color: 'var(--text-primary)'
                        }}>
                            {currentTutorial.content as string}
                        </div>
                    </div>
                )
        }
    }

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <header className="header">
                <div className="header-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/tutorials')}
                            className="logout-btn"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="header-title">{currentTutorial.title}</h1>
                            <p className="header-phone">{phoneNumber}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="logout-btn">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <div className="main-content">
                <div className="card fade-in">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)'
                        }}>
                            <Clock size={16} />
                            <span>{currentTutorial.estimatedTime}</span>
                        </div>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1rem',
                            margin: 0
                        }}>
                            {currentTutorial.description}
                        </p>
                    </div>

                    {renderContent()}

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        marginTop: '2rem'
                    }}>
                        {/* First row - Previous and Next/Complete buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem',
                            flexWrap: 'wrap'
                        }}>
                            {getPreviousTutorial() && (
                                <button
                                    onClick={handlePrevious}
                                    className="btn btn-secondary"
                                    style={{
                                        flex: '1 1 auto',
                                        minWidth: '120px'
                                    }}
                                >
                                    <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} />
                                    Previous
                                </button>
                            )}

                            {!isCompleted && currentTutorial.type !== 'quiz' && (
                                <button
                                    onClick={handleComplete}
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                    style={{
                                        flex: '1 1 auto',
                                        minWidth: '140px'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="spinner" style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }}></div>
                                            Completing...
                                        </>
                                    ) : (
                                        <>
                                            Mark Complete
                                            <CheckCircle size={20} style={{ marginLeft: '0.5rem' }} />
                                        </>
                                    )}
                                </button>
                            )}

                            {getNextTutorial() && (
                                <button
                                    onClick={handleNext}
                                    className="btn btn-primary"
                                    style={{
                                        flex: '1 1 auto',
                                        minWidth: '100px'
                                    }}
                                >
                                    Next
                                    <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                                </button>
                            )}

                            {!getNextTutorial() && (
                                <button
                                    onClick={() => navigate('/tutorials')}
                                    className="btn btn-secondary"
                                    style={{
                                        flex: '1 1 auto',
                                        minWidth: '120px'
                                    }}
                                >
                                    Back to List
                                </button>
                            )}
                        </div>
                    </div>

                    {isCompleted && (
                        <div className="success-message" style={{ marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
                                <strong>Tutorial completed!</strong>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PullToRefresh>
    )
}

export default TutorialView 