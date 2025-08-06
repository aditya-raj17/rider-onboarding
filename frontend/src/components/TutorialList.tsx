import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTutorial } from '../context/TutorialContext'
import { TutorialListProps } from '../types'
import {
    Video,
    Image,
    FileText,
    CheckCircle,
    LogOut,
    Trophy
} from 'lucide-react'

const TutorialList: React.FC<TutorialListProps> = ({ onLogout }) => {
    const navigate = useNavigate()
    const {
        tutorials,
        progress,
        loading,
        error,
        phoneNumber,
        getProgressPercentage,
        isTrainingComplete
    } = useTutorial()

    const getTutorialIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Video size={20} />
            case 'image':
                return <Image size={20} />
            case 'quiz':
                return <Trophy size={20} />
            default:
                return <FileText size={20} />
        }
    }

    const getTutorialStatus = (tutorial: any): 'completed' | 'current' | 'available' => {
        const tutorialProgress = progress[tutorial.id]

        if (tutorialProgress?.completed) {
            return 'completed'
        }

        // All incomplete tutorials are available for access
        return 'available'
    }

    const handleTutorialClick = (tutorial: any): void => {
        // Allow clicking on any tutorial, regardless of completion status
        navigate(`/tutorial/${tutorial.id}`)
    }

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading">
                    <div className="spinner"></div>
                    <p style={{ marginLeft: '1rem' }}>Loading tutorials...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-message">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <>
            <header className="header">
                <div className="header-content">
                    <div>
                        <h1 className="header-title">Training Progress</h1>
                        <p className="header-phone">{phoneNumber}</p>
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
                            justifyContent: 'space-between',
                            marginBottom: '1rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                margin: 0
                            }}>
                                Progress Overview
                            </h2>
                            <div style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)'
                            }}>
                                {getProgressPercentage()}% Complete
                            </div>
                        </div>

                        <div style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: 'var(--background-color)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${getProgressPercentage()}%`,
                                height: '100%',
                                backgroundColor: 'var(--primary-color)',
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>
                    </div>

                    {isTrainingComplete() && (
                        <div className="success-message" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trophy size={24} style={{ marginRight: '0.75rem', color: 'var(--success-color)' }} />
                                <div>
                                    <strong style={{ fontSize: '1.125rem', color: 'var(--success-color)' }}>
                                        🎉 Congratulations! 🎉
                                    </strong>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        You have successfully completed all tutorials!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            marginBottom: '1rem'
                        }}>
                            Tutorials
                        </h3>

                        {tutorials.map((tutorial) => {
                            const status = getTutorialStatus(tutorial)
                            const isCompleted = status === 'completed'

                            return (
                                <div
                                    key={tutorial.id}
                                    className={`tutorial-item ${status}`}
                                    onClick={() => handleTutorialClick(tutorial)}
                                    style={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '1rem'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: isCompleted ? 'var(--success-color)' : 'var(--primary-color)',
                                            color: isCompleted ? 'white' : 'white',
                                            flexShrink: 0
                                        }}>
                                            {isCompleted ? (
                                                <CheckCircle size={20} />
                                            ) : (
                                                getTutorialIcon(tutorial.type)
                                            )}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <h4 style={{
                                                    fontSize: '1rem',
                                                    fontWeight: '500',
                                                    color: 'var(--text-primary)',
                                                    margin: 0
                                                }}>
                                                    {tutorial.title}
                                                </h4>
                                                {isCompleted && (
                                                    <CheckCircle size={16} color="var(--success-color)" />
                                                )}
                                            </div>

                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--text-secondary)',
                                                marginBottom: '0.5rem'
                                            }}>
                                                {tutorial.description}
                                            </p>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                fontSize: '0.75rem',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                <span>⏱ {tutorial.estimatedTime}</span>
                                                <span>📋 {tutorial.order} of {tutorials.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}

export default TutorialList 