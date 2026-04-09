import axios from "axios";
const API_BASE = "http://localhost:3000"
axios.defaults.withCredentials = true

// Add a response interceptor
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and not already a retry or refresh attempt
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/auth/refresh')) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                await axios.post(`${API_BASE}/api/auth/refresh`);

                // If successful, retry the original request
                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login or handle as needed
                console.error("Token refresh failed:", refreshError);
                // Optional: window.location.href = '/auth';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

const generateBacklog = async ({ files, text }) => {
    let formdata = new FormData()

    if (files && files.length > 0) {
        files.forEach(file => {
            formdata.append("files", file.file)
        })
    }
    if (text) {
        formdata.append("text", text)
    }
    try {
        const response = await axios.post(`${API_BASE}/api/generate-backlog`, formdata)
        console.log(response.data)
        return response.data
    } catch (err) {
        console.log(err)
        throw err
    }
}

const exportToCSV = async (backlog) => {
    try {
        const response = await axios.post(`${API_BASE}/api/export-csv`, { backlog },
            {
                headers: {
                    "Content-Type": "application/json"
                },
                responseType: "blob"
            })
        console.log(response.data)
        return response.data

    } catch (err) {
        console.log(err)
        throw err
    }
}

const getPricingTiers = async () => {
    try {
        const response = await axios.get(`${API_BASE}/api/pricing-tiers`)
        console.log("Pricing Tiers", response.data)
        return response.data.tiers
    } catch (err) {
        console.log(err)
        throw err
    }
}

const createCheckoutSession = async (planName) => {
    try {
        const response = await axios.post(`${API_BASE}/api/create-checkout-session`, { planName })
        return response.data.url
    } catch (err) {
        console.log(err)
        throw err
    }
}

const getProjects = async () => {
    try {
        const response = await axios.get(`${API_BASE}/api/project/projects`)
        return response.data
    } catch (err) {
        console.log(err)
        throw err
    }
}

const getProjectById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE}/api/project/${id}`)
        return response.data.project
    } catch (err) {
        console.log(err)
        throw err
    }
}

export { generateBacklog, exportToCSV, getPricingTiers, createCheckoutSession, getProjects, getProjectById }