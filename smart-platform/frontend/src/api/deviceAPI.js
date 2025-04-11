import axios from './axiosConfig';

export const fetchDevices = (filters) => {
    return axios.get('/devices', { params: filters });
};