const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

// ဇာတ်ကား သို့မဟုတ် ဝတ္ထု အသစ်တင်ရန် (POST)
router.post('/add', async (req, res) => {
    try {
        const newContent = new Content(req.body);
        const savedContent = await newContent.save();
        res.status(201).json(savedContent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// တင်ထားသမျှ အကုန်ပြန်ကြည့်ရန် (GET)
router.get('/all', async (req, res) => {
    try {
        const contents = await Content.find();
        res.json(contents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Data ဖျက်ရန် (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        await Content.findByIdAndDelete(req.params.id);
        res.json({ message: 'အောင်မြင်စွာ ဖျက်ပြီးပါပြီ' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;