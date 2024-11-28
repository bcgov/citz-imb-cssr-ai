const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const searchRoutes = require('./routes/search');

const { API_HTTP_PORT, OPENAI_API_KEY } = process.env;

const app = express();
const PORT = +(API_HTTP_PORT ?? 8000);
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
  });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running correctly');
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

module.exports = { app, openai };
