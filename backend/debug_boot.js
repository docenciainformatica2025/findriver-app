require('dotenv').config();

console.log('Starting Debug Sequence...');

try {
    console.log('1. Loading Firebase Config...');
    const firebase = require('./src/config/firebase');
    console.log('   - Firebase Loaded. DB is:', !!firebase.db);

    console.log('2. Loading User Model...');
    require('./src/models/User');
    console.log('   - User Model Loaded');

    console.log('3. Loading Vehicle Model...');
    require('./src/models/Vehicle');
    console.log('   - Vehicle Model Loaded');

    console.log('4. Loading Transaction Model...');
    require('./src/models/Transaction');
    console.log('   - Transaction Model Loaded');

    console.log('5. Loading Shift Model...');
    require('./src/models/Shift');
    console.log('   - Shift Model Loaded');

    console.log('6. Loading App...');
    require('./src/app');
    console.log('   - App Loaded');

    console.log('SUCCESS: All modules verified.');
} catch (error) {
    console.error('\nCRASH DETECTED!');
    console.error('Location:', error.stack.split('\n')[1]);
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
}
