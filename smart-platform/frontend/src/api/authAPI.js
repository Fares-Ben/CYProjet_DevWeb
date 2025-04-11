import axios from './axiosConfig';

export const register = async (userData) => {
    const response = await axios.post('/auth/register', userData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    return response.data.user;
};