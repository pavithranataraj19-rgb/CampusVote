import axios from "axios";

const API = axios.create({
  baseURL: "https://campusvote-backend-2bgj.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;