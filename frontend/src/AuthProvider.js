import React, { createContext, useContext, useState, useEffect } from 'react';
import Axios from './Axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    useEffect(() => {
        if (user) {
            setUser(user);
        }
        else {
            setUser(null);
        }
    }, [user]);

    const login = async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            const response = await Axios.post('/api/auth/login', formData, config);
            let accessToken = response.data.access_token;
            localStorage.setItem("token", accessToken);
            Axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            const data = await Axios.get('/api/auth/me');
            if (data) {
                localStorage.setItem('user', JSON.stringify(data));
                setUser(data);
                return true;
            }
            throw new Error(data.message);
        } catch (error) {
            console.error('Login failed', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    const isAuthenticated = () => {
        return user !== null;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
