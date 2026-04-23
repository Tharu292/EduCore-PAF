import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api/reviews",
});

export const saveResourceReview = (data) => API.post("", data);
export const getResourceReviews = (resourceId) => API.get(`/resource/${resourceId}`);
export const getResourceReviewSummary = (resourceId) => API.get(`/resource/${resourceId}/summary`);
