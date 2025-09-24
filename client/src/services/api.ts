import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL,
  timeout: 10_000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    let message = "Request failed";
    
    if (err.response) {
      const status = err.response.status;
      const data = err.response.data;
      
      if (status === 427) {
        message = "Weather service rate limit exceeded. Please try again later.";
      } else if (status === 400) {
        message = data?.message || data?.error || "Invalid request";
      } else if (status === 404) {
        message = data?.message || "Resource not found";
      } else if (status === 500) {
        message = data?.message || "Internal server error";
      } else if (status >= 500) {
        message = "Server error. Please try again later.";
      } else if (status === 401) {
        message = "Unauthorized access";
      } else if (status === 403) {
        message = "Access forbidden";
      } else {
        message = data?.message || data?.error || `Request failed with status ${status}`;
      }
    } else if (err.request) {
      // Network error
      message = "Network error. Please check your connection.";
    } else {
      // Other error
      message = err.message || "Unexpected error occurred";
    }
    
    return Promise.reject(new Error(message));
  }
);
