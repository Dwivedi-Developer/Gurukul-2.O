import axios from "axios"

export const axiosInstance = axios.create({ baseURL: 'http://localhost:3000', // Set your base URL here
timeout: 10000});

export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method:`${method}`,
        url:`${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers: null,
        params: params ? params : null,
    });
}