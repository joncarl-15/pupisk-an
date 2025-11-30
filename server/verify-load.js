const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const CONCURRENT_REQUESTS = 20;

async function simulateLoad() {
    console.log(`Starting load test with ${CONCURRENT_REQUESTS} concurrent requests...`);

    // 1. Generate a QR code first
    let qrId;
    let qrCode;
    try {
        const genRes = await axios.post(`${BASE_URL}/qrcodes/generate`, { quantity: 1, label: 'LoadTest' });
        // We need to fetch it to get the ID and Code
        const allQrs = await axios.get(`${BASE_URL}/qrcodes`);
        const latest = allQrs.data[0];
        qrId = latest._id;
        qrCode = latest.code;
        console.log(`Generated QR: ${qrCode} (${qrId})`);
    } catch (e) {
        console.error('Failed to generate QR:', e.message);
        return;
    }

    // 2. Register it (simulate first scan)
    try {
        await axios.post(`${BASE_URL}/attendees`, {
            qr_code_id: qrId,
            full_name: 'Load Tester',
            course: 'BSCS',
            year_level: '4'
        });
        console.log('Registered attendee.');
    } catch (e) {
        console.error('Failed to register:', e.message);
        return;
    }

    // 3. Simulate concurrent check-outs (race condition test)
    const promises = [];
    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
        promises.push(
            axios.post(`${BASE_URL}/attendees`, { qr_code_id: qrId })
                .then(res => ({ status: res.status, data: res.data }))
                .catch(err => ({ status: err.response?.status || 500, data: err.response?.data }))
        );
    }

    const results = await Promise.all(promises);

    // Analyze results
    let successCount = 0;
    let alreadyCheckedOutCount = 0;
    let errors = 0;

    results.forEach(r => {
        if (r.status === 200) {
            if (r.data.message === 'Checked Out') successCount++;
            else if (r.data.message === 'Already Checked Out') alreadyCheckedOutCount++;
        } else {
            errors++;
            console.log('Error:', r.data);
        }
    });

    console.log('--- Results ---');
    console.log(`Total Requests: ${CONCURRENT_REQUESTS}`);
    console.log(`Successful Checkouts (First): ${successCount}`);
    console.log(`Already Checked Out (Subsequent): ${alreadyCheckedOutCount}`);
    console.log(`Errors: ${errors}`);

    if (successCount === 1 && alreadyCheckedOutCount === CONCURRENT_REQUESTS - 1) {
        console.log('✅ TEST PASSED: Race condition handled correctly.');
    } else {
        console.log('❌ TEST FAILED: Race condition detected or errors occurred.');
    }
}

simulateLoad();
