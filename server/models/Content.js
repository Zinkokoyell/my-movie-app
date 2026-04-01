const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: { type: String, required: true },         // ဇာတ်ကား/ဝတ္ထု နာမည်
    description: { type: String, required: true },   // အကျဉ်းချုပ်/စာသား
    type: { type: String, enum: ['movie', 'story'], required: true }, // အမျိုးအစားခွဲခြားတာ
    genre: { type: String },                         // Action, Romance, etc.
    videoUrl: { type: String },                      // ဇာတ်ကားဆိုရင် link
    createdAt: { type: Date, default: Date.now }     // တင်တဲ့ရက်စွဲ
});

module.exports = mongoose.model('Content', contentSchema);