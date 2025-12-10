const axios = require('axios');

const API_URL = 'https://findriver-app.onrender.com/api/v1/debug/status';

async function checkVersion() {
    console.log('Checking Server Version on:', API_URL);
    try {
        const response = await axios.get(API_URL);
        console.log('Server Status:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Check Failed:', error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
}

checkVersion();
