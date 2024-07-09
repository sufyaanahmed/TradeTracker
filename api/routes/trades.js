// backend/routes/trades.js
const express = require('express');
const Trade = require('../models/trade');
const router = express.Router();
const authenticate = require("../middleware/auth");
const mongoose = require('mongoose');


router.post('/trade',authenticate, async (req, res) => {
  await mongoose.connect(process.env.MONGO_URL);
  try {
    const { name, date, reason, pl } = req.body;
    const trade = await Trade.create({ name, date, reason, pl, userId :req.uid });
    res.json(trade);
    console.log("doneee",trade);
  } catch (error) {
    console.error('Error creating trade:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/trades',authenticate, async (req, res) => {
  //await mongoose.connect(process.env.MONGO_URL);
  try {
    const trades = await Trade.find({ userId: req.uid });
    res.json(trades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router;
