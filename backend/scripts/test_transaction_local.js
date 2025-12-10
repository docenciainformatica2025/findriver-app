const Transaction = require('../src/models/Transaction');

async function testModel() {
    console.log('Testing Transaction Model Structure...');

    // Check Static Methods
    if (typeof Transaction.findOne !== 'function') {
        console.error('❌ Transaction.findOne is MISSING');
    } else {
        console.log('✅ Transaction.findOne exists');
    }

    // Check Instance Methods
    const tx = new Transaction({ _id: 'test_id', userId: 'user_1' });
    if (typeof tx.deleteOne !== 'function') {
        console.error('❌ tx.deleteOne is MISSING');
    } else {
        console.log('✅ tx.deleteOne exists');
    }

    console.log('Model verification complete.');
}

testModel();
