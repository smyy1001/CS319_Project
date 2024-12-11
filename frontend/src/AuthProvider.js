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
            Axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            const dataa = await Axios.get('/api/auth/me');
            // console.log("heree: ", dataa);
            if (dataa) {
                localStorage.setItem('user', JSON.stringify(dataa.data.user));
                localStorage.setItem('details', JSON.stringify(dataa.data.details));
                localStorage.setItem("token", accessToken);
                localStorage.setItem("role", response.data.role);
                setUser(dataa.data.user);
                return true;
            }
            throw new Error(dataa.message);
        } catch (error) {
            console.error('Login failed', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
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
