import axios from "axios";
const API_BASE = "http://localhost:3000"
axios.defaults.withCredentials = true

const login = async (data) => {
    const response = await axios.post(`${API_BASE}/api/auth/login`, data)
    return response.data
}

const register = async (data) => {
    const response = await axios.post(`${API_BASE}/api/auth/register`, data)
    return response.data
}

const isAuthenticated = async () => {
    try {
        const response = await axios.get(`${API_BASE}/api/auth/isAuthenticated`)
        return response.data.message == "authenticated"
    } catch (error) {
        console.log(error.response.data.message)
        console.log(error)

        return false
    }
}

const logout = async () => {
    try {
        const response = await axios.post(`${API_BASE}/api/auth/logout`)
        return response.data.message == "Logout successful"
    } catch (error) {
        console.log(error)
        return false
    }
}

export { login, register, isAuthenticated, logout }