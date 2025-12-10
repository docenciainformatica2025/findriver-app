const https = require('https');

function checkUrl(path) {
    const url = `https://findriver-app.onrender.com${path}`;
    console.log(`Checking ${url}...`);

    https.get(url, (res) => {
        let data = '';
        console.log(`[${path}] Status Code:`, res.statusCode);

        res.on('data', (chunk) => { data += chunk; });

        res.on('end', () => {
            try {
                if (res.statusCode === 200) {
                    const json = JSON.parse(data);
                    console.log(`[${path}] ✅ RESPONSE:`, JSON.stringify(json, null, 2));
                } else {
                    console.log(`[${path}] ❌ ERROR RESPONSE:`, data.substring(0, 100));
                }
            } catch (e) {
                console.log(`[${path}] ❌ PARSE ERROR:`, e.message);
            }
        });
    }).on('error', (err) => {
        console.log(`[${path}] ❌ REQUEST ERROR:`, err.message);
    });
}

// Check Health (to see uptime) and specific debug route
checkUrl('/health');
checkUrl('/api/v1/debug/status');
