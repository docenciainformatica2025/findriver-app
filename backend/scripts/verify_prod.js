const https = require('https');

function checkStatus() {
    const url = 'https://findriver-app.onrender.com/api/v1/debug/status';
    console.log(`Checking ${url}...`);

    https.get(url, (res) => {
        let data = '';
        console.log('Status Code:', res.statusCode);

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                if (res.statusCode === 200) {
                    const json = JSON.parse(data);
                    console.log('✅ RESPONSE:', JSON.stringify(json, null, 2));
                } else {
                    console.log('❌ ERROR RESPONSE:', data);
                }
            } catch (e) {
                console.log('❌ PARSE ERROR:', e.message);
                console.log('Raw Data:', data);
            }
        });

    }).on('error', (err) => {
        console.log('❌ REQUEST ERROR:', err.message);
    });
}

checkStatus();
