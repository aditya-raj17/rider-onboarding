import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PhoneEntry from './components/PhoneEntry.tsx'
import TutorialList from './components/TutorialList.tsx'
import TutorialView from './components/TutorialView.tsx'
import { TutorialProvider } from './context/TutorialContext.tsx'
import './App.css'

function App() {
    const [phoneNumber, setPhoneNumber] = useState<string>(localStorage.getItem('phoneNumber') || '')
    const [isLoading] = useState<boolean>(false)

    const handlePhoneSubmit = (phone: string): void => {
        setPhoneNumber(phone)
        localStorage.setItem('phoneNumber', phone)
    }

    const handleLogout = (): void => {
        setPhoneNumber('')
        localStorage.removeItem('phoneNumber')
    }

    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <TutorialProvider phoneNumber={phoneNumber}>
            <div className="App">
                <Routes>
                    <Route
                        path="/"
                        element={
                            phoneNumber ?
                                <Navigate to="/tutorials" replace /> :
                                <PhoneEntry onSubmit={handlePhoneSubmit} />
                        }
                    />
                    <Route
                        path="/tutorials"
                        element={
                            phoneNumber ?
                                <TutorialList onLogout={handleLogout} /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/tutorial/:id"
                        element={
                            phoneNumber ?
                                <TutorialView onLogout={handleLogout} /> :
                                <Navigate to="/" replace />
                        }
                    />
                </Routes>
            </div>
        </TutorialProvider>
    )
}

export default App 