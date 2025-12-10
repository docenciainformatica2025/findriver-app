const axios = require('axios');

const API_URL = 'https://findriver-app.onrender.com/api/v1/debug/diagnose-db';

async function diagnose() {
    console.log('Running remote diagnosis on:', API_URL);
    try {
        const response = await axios.get(API_URL);
        console.log('Diagnosis Success:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.error('Diagnosis Failed (Expected 500?):');
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Network Error:', error.message);
        }
    }
}

diagnose();
