import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userLevel, setUserLevel] = useState(null);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            userLevel,
            setIsAuthenticated,
            setUserLevel
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Exportez explicitement le hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
};