import React, { useEffect, useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Api } from './api';
import InputPage from './pages/InputPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ClipLoader from 'react-spinners/ClipLoader';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AppShell({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (e) {
            console.error(e);
        }
    };

    const handleHistoryClick = () => {
        if (location.pathname !== '/history') {
            navigate('/history');
        }
    };

    const handleHomeClick = () => {
        if (location.pathname !== '/input') {
            navigate('/input');
            return;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="app-root app-v2">
            <header className="top-bar">
                <button className="top-bar-left display-flex logo-home-btn" type="button" onClick={handleHomeClick}>
                    <img src='ystu_logo.svg' className="logo-img" alt="На главную" />
                    <span className="logo-text">Рейтинг <br/> ЯГТУ</span>
                </button>
                {user && (
                    <div className="top-bar-right">
                        <button className="header-pill history-pill" onClick={handleHistoryClick} title="История">
                            <span className="header-pill-icon">↻</span>
                            <span>История</span>
                        </button>
                        <button className="header-pill logout-pill" onClick={handleLogout} title="Выйти">
                            <img src="logout.svg" alt="Выйти" />
                            <span>Выйти</span>
                        </button>
                    </div>
                )}
            </header>
            <main className="page-body">{children}</main>
        </div>
    );
}

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // при загрузке проверяем /me (есть ли активная сессия)
    useEffect(() => {
        (async () => {
            try {
                const me = await Api.me();
                setUser(me);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const login = (u) => setUser(u);
    const logout = async () => {
        await Api.logout();
        setUser(null);
    };

    const authValue = { user, loading, login, logout };

    return (
        <AuthContext.Provider value={authValue}>
        {loading? (
            <div className="loading-overlay">
                <ClipLoader size={50} color={"#3498db"} loading={true}/>
                <div className="loading-text">Пожалуйста, подождите...</div>
            </div>
        ):(    <AppShell>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Navigate to="/input" replace />
                            </PrivateRoute>
                        }
                    />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        path="/input"
                        element={
                            <PrivateRoute>
                                <InputPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/history"
                        element={
                            <PrivateRoute>
                                <HistoryPage />
                            </PrivateRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AppShell>
            )}
        </AuthContext.Provider>
    );
}
