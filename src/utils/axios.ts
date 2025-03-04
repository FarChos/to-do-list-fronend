// axios.js - Archivo centralizado para peticiones HTTP
import axios from 'axios';

const backend = axios.create({
    baseURL: 'http://localhost:8081', // Asegurar que todas las peticiones van al backend correcto
    headers: {
        'Content-Type': 'application/json',
    }
});

export { backend };