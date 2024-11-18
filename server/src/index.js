const express = require('express');
const cors = require('cors');
const searchRoutes = require('./routes/search');

const { API_HTTP_PORT } = process.env;

const app = express();
const PORT = +(API_HTTP_PORT ?? 8000);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/search', searchRoutes); 

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});