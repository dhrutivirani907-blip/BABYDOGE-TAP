const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-Memory Database (Aap ise MongoDB ya kisi DB se replace kar sakte hain)
let withdrawalRequests = [];

// Minimum Withdrawal Limit for BabyDoge
const MIN_WITHDRAWAL_LIMIT = 1000000;

// 1. HEALTH CHECK ENDPOINT
app.get('/', (req, res) => {
    res.send({ status: 'OK', message: 'BabyDoge Tapping Backend Server is Running!' });
});

// 2. WITHDRAWAL SUBMISSION ENDPOINT
app.post('/api/bonk/withdraw', (req, res) => {
    const { binanceId, amount, tokenType, currentBalance } = req.body;

    // Strict Validation: Check if Binance ID is strictly numeric (5-12 digits)
    const isStrictBinanceID = /^\d{5,12}$/.test(binanceId);

    if (!binanceId || !isStrictBinanceID) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid Binance Pay ID. Only numeric Binance Pay IDs are allowed. Crypto wallet addresses are strictly prohibited.' 
        });
    }

    if (!amount || amount < MIN_WITHDRAWAL_LIMIT) {
        return res.status(400).json({ 
            success: false, 
            message: `Minimum withdrawal limit is ${MIN_WITHDRAWAL_LIMIT.toLocaleString()} BABYDOGE.` 
        });
    }

    // Save request to database
    const newRequest = {
        id: 'REQ_' + Date.now(),
        binanceId: binanceId,
        amount: Number(amount),
        tokenType: tokenType || 'BABYDOGE',
        status: 'Pending',
        timestamp: new Date().toISOString()
    };

    withdrawalRequests.push(newRequest);

    res.status(200).json({ 
        success: true, 
        message: 'Withdrawal request submitted successfully!',
        data: newRequest
    });
});

// 3. FETCH ALL WITHDRAWAL REQUESTS
app.get('/api/bonk/withdrawals', (req, res) => {
    // Returns all stored requests (Frontend filter will ensure only BABYDOGE is parsed)
    res.status(200).json(withdrawalRequests);
});

// 4. UPDATE WITHDRAWAL STATUS (ADMIN PANEL)
app.put('/api/bonk/withdrawals/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const requestItem = withdrawalRequests.find(item => item.id === id);

    if (!requestItem) {
        return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    requestItem.status = status || requestItem.status;

    res.status(200).json({ 
        success: true, 
        message: `Status updated to ${status}`,
        data: requestItem
    });
});

// 5. RECHARGE ENERGY ENDPOINT
app.post('/api/bonk/recharge-energy', (req, res) => {
    const { energyAmount } = req.body;

    res.status(200).json({ 
        success: true, 
        message: `Energy refilled successfully by ${energyAmount || 1000} XP.` 
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 BabyDoge Server running on port ${PORT}`);
});
