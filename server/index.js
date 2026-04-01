const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// static folder setting - ပုံတွေကို Browser ကနေ လှမ်းကြည့်လို့ရအောင်
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect('mongodb+srv://zinkokoyell_db_user:Zkky686408@cluster0.vo2hjtt.mongodb.net/movie_story_db?appName=Cluster0')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


// server/index.js (Schema ပိုင်း)
const ContentSchema = new mongoose.Schema({
    title: String,
    description: String,
    type: String,
    genre: String,
    videoUrl: String,
    imageUrl: String,
    rating: Number, // Rating (ဥပမာ- 8.5)
    downloadUrl: String // Download Link
});

const Content = mongoose.model('Content', ContentSchema);

// --- Multer Configuration ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- API Routes ---

// ၁။ ပုံသီးသန့် Upload လုပ်သည့် Route (ဒါက အသစ်ပါ)
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'ပုံတင်ရန် လိုအပ်သည်' });
    }
    // ပုံရဲ့ filename ကိုပဲ ပြန်ပို့သည်
    res.json({ filename: req.file.filename });
});

// ၂။ Content စာသားများကို သိမ်းသည့် Route
app.post('/api/contents/add', async (req, res) => {
    try {
        const newContent = new Content(req.body); // Frontend က ပုံ URL ပါ တွဲပို့ပေးမည်
        await newContent.save();
        res.json({ message: 'အောင်မြင်စွာ တင်ပြီးပါပြီ!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ၃။ All Contents
app.get('/api/contents/all', async (req, res) => {
    try {
        const contents = await Content.find();
        res.json(contents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ၄။ Delete
app.delete('/api/contents/:id', async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) return res.status(404).json({ error: 'မတွေ့ရှိပါ' });

        // ပုံကိုပါ Server ပေါ်က ဖျက်သည်
        if (content.imageUrl) {
            const imagePath = path.join(__dirname, 'uploads', content.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Content.findByIdAndDelete(req.params.id);
        res.json({ message: 'ဖျက်ပြီးပါပြီ' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// server/index.js ထဲမှာ ထည့်ရန်

// 1. Admin Schema သတ်မှတ်ခြင်း
const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});
const AdminModel = mongoose.model("admins", AdminSchema);

// 2. Login API ပြုလုပ်ခြင်း
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await AdminModel.findOne({ username, password });
        if (admin) {
            res.json({ success: true, message: "Login အောင်မြင်ပါသည်" });
        } else {
            res.status(401).json({ success: false, message: "Username သို့မဟုတ် Password မှားနေပါသည်" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));