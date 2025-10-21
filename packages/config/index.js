const BACKEND_PORT = process.env.PORT || 5000;
const config = {
  API_BASE: process.env.API_BASE || `http://localhost:${BACKEND_PORT}/api`,
};

export default config;
