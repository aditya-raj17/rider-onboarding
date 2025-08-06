import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTutorial } from '../context/TutorialContext'
import { TutorialViewProps, Tutorial, QuizContent } from '../types'
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
        saveProgress
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

                // If this is the last tutorial, just show completion message
                // The completion message will be shown on the tutorial list page
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
            handleComplete()
        }
    }

    const getNextTutorial = (): Tutorial | undefined => {
        if (!currentTutorial) return undefined
        const currentIndex = tutorials.findIndex(t => t.id === currentTutorial.id)
        return tutorials[currentIndex + 1]
    }

    const getPreviousTutorial = (): Tutorial | undefined => {
        if (!currentTutorial) return undefined
        const currentIndex = tutorials.findIndex(t => t.id === currentTutorial.id)
        return tutorials[currentIndex - 1]
    }

    const handleNext = (): void => {
        const nextTutorial = getNextTutorial()
        if (nextTutorial) {
            navigate(`/tutorial/${nextTutorial.id}`)
        }
    }

    const handlePrevious = (): void => {
        const previousTutorial = getPreviousTutorial()
        if (previousTutorial) {
            navigate(`/tutorial/${previousTutorial.id}`)
        }
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
                    const getYouTubeVideoId = (url: string): string => {
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
                        const match = url.match(regExp)
                        return (match && match[2].length === 11) ? match[2] : ''
                    }

                    const videoId = getYouTubeVideoId(videoUrl)
                    const embedUrl = `https://www.youtube.com/embed/${videoId}`

                    return (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                paddingBottom: '56.25%', // 16:9 aspect ratio
                                borderRadius: '0.5rem',
                                overflow: 'hidden'
                            }}>
                                <iframe
                                    src={embedUrl}
                                    title={currentTutorial.title}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        border: 'none'
                                    }}
                                    allowFullScreen
                                />
                            </div>
                            <div style={{
                                padding: '1rem',
                                backgroundColor: 'var(--warning-color)',
                                borderRadius: '0.5rem',
                                marginTop: '1rem'
                            }}>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.875rem',
                                    color: 'var(--text-primary)'
                                }}>
                                    <strong>Note:</strong> For YouTube videos, please manually mark as complete after watching.
                                </p>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <video
                                controls
                                style={{
                                    width: '100%',
                                    borderRadius: '0.5rem'
                                }}
                                onTimeUpdate={handleVideoProgress}
                            >
                                <source src={videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            {videoProgress > 0 && (
                                <div style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    Progress: {Math.round(videoProgress)}%
                                </div>
                            )}
                        </div>
                    )
                }

            case 'image':
                return (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <img
                            src={currentTutorial.content as string}
                            alt={currentTutorial.title}
                            style={{
                                width: '100%',
                                borderRadius: '0.5rem'
                            }}
                        />
                    </div>
                )

            case 'quiz':
                const quizContent = currentTutorial.content as QuizContent
                return (
                    <div style={{ marginBottom: '1.5rem' }}>
                        {!quizSubmitted ? (
                            <div>
                                {quizContent.questions.map((question, questionIndex) => (
                                    <div key={question.id} style={{ marginBottom: '2rem' }}>
                                        <h4 style={{
                                            fontSize: '1rem',
                                            fontWeight: '500',
                                            color: 'var(--text-primary)',
                                            marginBottom: '1rem'
                                        }}>
                                            {questionIndex + 1}. {question.question}
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {question.options.map((option, optionIndex) => (
                                                <label
                                                    key={optionIndex}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '0.75rem',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '0.5rem',
                                                        cursor: 'pointer',
                                                        backgroundColor: quizAnswers[question.id] === optionIndex ? 'var(--primary-color)' : 'transparent',
                                                        color: quizAnswers[question.id] === optionIndex ? 'white' : 'var(--text-primary)'
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
                            <div style={{
                                padding: '1.5rem',
                                backgroundColor: quizScore >= 80 ? 'var(--success-color)' : 'var(--error-color)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>
                                    Quiz {quizScore >= 80 ? 'Passed!' : 'Failed'}
                                </h4>
                                <p style={{ margin: 0 }}>
                                    Your score: {quizScore}% ({Math.round((quizScore / 100) * quizContent.questions.length)} out of {quizContent.questions.length} correct)
                                </p>
                                {quizScore < 80 && (
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                        You need 80% or higher to pass. Please try again.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )

            default:
                return (
                    <div style={{
                        marginBottom: '1.5rem',
                        lineHeight: '1.6',
                        color: 'var(--text-primary)'
                    }}>
                        {currentTutorial.content as string}
                    </div>
                )
        }
    }

    return (
        <>
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
        </>
    )
}

export default TutorialView 