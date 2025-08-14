let IS_PROD =true;
const server=IS_PROD?
    "https://video-backend-q7a6.onrender.com":
    "https://localhost:8000"


export default server;