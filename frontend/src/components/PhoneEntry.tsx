import React, { useState } from 'react'
import { Phone, ArrowRight } from 'lucide-react'
import { PhoneEntryProps } from '../types'
import PullToRefresh from './PullToRefresh'

const PhoneEntry: React.FC<PhoneEntryProps> = ({ onSubmit }) => {
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const validatePhoneNumber = (phone: string): string | null => {
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '')

        // Check if it's a valid phone number (10-15 digits)
        if (cleaned.length < 10 || cleaned.length > 15) {
            return 'Please enter a valid phone number (10-15 digits)'
        }

        return null
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault()

        const validationError = validatePhoneNumber(phoneNumber)
        if (validationError) {
            setError(validationError)
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            // Simulate API call to verify phone number
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Format phone number for display
            const formattedPhone = phoneNumber.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
            onSubmit(formattedPhone)
        } catch (err) {
            setError('Failed to verify phone number. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value
        setPhoneNumber(value)

        // Clear error when user starts typing
        if (error) {
            setError('')
        }
    }

    const handleRefresh = async (): Promise<void> => {
        // This will trigger a reload of the page
        window.location.reload()
    }

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <div className="page-container">
                <div className="card fade-in">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            backgroundColor: 'var(--primary-color)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <Phone size={40} color="white" />
                        </div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem'
                        }}>
                            Welcome to Rider Training
                        </h1>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1rem',
                            lineHeight: '1.5'
                        }}>
                            Enter your phone number to start your onboarding journey
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label
                                htmlFor="phone"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '500',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                className="input"
                                placeholder="Enter your phone number"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                disabled={isSubmitting}
                                autoComplete="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                required
                            />
                            {error && (
                                <p style={{
                                    color: 'var(--error-color)',
                                    fontSize: '0.875rem',
                                    marginTop: '0.5rem'
                                }}>
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting || !phoneNumber.trim()}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner" style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }}></div>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Start Training
                                    <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        backgroundColor: 'var(--background-color)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                    }}>
                        <p style={{ marginBottom: '0.5rem' }}>
                            <strong>What you'll learn:</strong>
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                            <li>Safety guidelines and best practices</li>
                            <li>How to use the delivery app effectively</li>
                            <li>Customer service excellence</li>
                            <li>Final assessment to complete training</li>
                        </ul>
                    </div>
                </div>
            </div>
        </PullToRefresh>
    )
}

export default PhoneEntry 