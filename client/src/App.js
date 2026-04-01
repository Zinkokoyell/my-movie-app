import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// --- Home Page Component ---
const Home = ({ contents, searchTerm }) => {
  const [filterType, setFilterType] = useState('all');
  const [selectedContent, setSelectedContent] = useState(null);

  const filtered = contents.filter(item =>
    item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderSection = (title, type) => {
    const items = filtered.filter(item => item.type === type);
    if (items.length === 0) return null;

    return (
      <div className="content-section">
        <h2 className="section-title">{title}</h2>
        <div className="scroll-container">
          {items.map(item => (
            <div key={item._id} className="movie-card" onClick={() => setSelectedContent(item)}>
              <div className="poster-wrapper">
                <img
                  src={`http://localhost:5000/uploads/${item.imageUrl}`}
                  alt={item.title}
                  className="poster-img"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150x200?text=No+Poster';
                  }}
                />
              </div>
              <p className="movie-title">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="home-container">
      <div className="filter-dropdown-container">
        <label className="filter-label">Categories:</label>
        <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">အားလုံး</option>
          <option value="movie">ရုပ်ရှင်များ</option>
          <option value="story">ဝတ္ထုများ</option>
        </select>
      </div>

      <div className="sections-wrapper">
        {(filterType === 'all' || filterType === 'movie') && renderSection("Movies", "movie")}
        {(filterType === 'all' || filterType === 'story') && renderSection("Novels", "story")}
      </div>

      {selectedContent && (
        <div className="modal-overlay" onClick={() => setSelectedContent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-poster-wrapper">
              <img src={`http://localhost:5000/uploads/${selectedContent.imageUrl}`} alt={selectedContent.title} className="modal-poster-img" />
            </div>
            <div className="modal-details">
              <h1 className="modal-title">{selectedContent.title}</h1>
              <div className="modal-badge-group">
                <span className="modal-badge">{selectedContent.type}</span>
                <span className="modal-badge">{selectedContent.genre}</span>
              </div>
              {selectedContent.rating && <p className="modal-rating">⭐ {selectedContent.rating}/10</p>}
              <p className="modal-description">{selectedContent.description}</p>
              <div className="modal-actions">
                {selectedContent.videoUrl && (
                  <a href={selectedContent.videoUrl} target="_blank" rel="noreferrer" className="modal-button btn-watch-modal">Watch Now</a>
                )}
                {selectedContent.downloadUrl && (
                  <a href={selectedContent.downloadUrl} target="_blank" rel="noreferrer" className="modal-button btn-download">Download</a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Admin Page Component ---
const Admin = ({ contents, fetchContents }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'movie', genre: '', videoUrl: '', rating: '', downloadUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem("adminToken") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', loginData);
      if (res.data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("adminToken", "true");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login လုပ်၍မရပါ");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setImageFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) { alert('Poster ပုံ ရွေးရန် လိုအပ်သည်'); return; }
    try {
      const imageData = new FormData();
      imageData.append('image', imageFile);
      const uploadRes = await axios.post('http://localhost:5000/api/upload', imageData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const finalData = { ...formData, imageUrl: uploadRes.data.filename };
      await axios.post('http://localhost:5000/api/contents/add', finalData);
      alert('အောင်မြင်စွာ တင်ပြီးပါပြီ!');
      setFormData({ title: '', description: '', type: 'movie', genre: '', videoUrl: '', rating: '', downloadUrl: '' });
      setImageFile(null);
      e.target.reset();
      fetchContents();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // --- Delete Function ---
  const deleteContent = async (id) => {
    if (window.confirm('တကယ်ဖျက်မှာ သေချာပါသလား?')) {
      try {
        await axios.delete(`http://localhost:5000/api/contents/${id}`);
        alert('ဖျက်ပြီးပါပြီ');
        fetchContents();
      } catch (err) {
        alert('ဖျက်လို့မရပါ');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Admin Login</h2>
          <input type="text" placeholder="Username" onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} required />
          <input type="password" placeholder="Password" onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <button onClick={() => { sessionStorage.removeItem("adminToken"); setIsAuthenticated(false); }} className="btn-logout">Logout</button>

      <form onSubmit={handleSubmit} className="content-form">
        <h2>Add New Content</h2>
        <input name="title" placeholder="ခေါင်းစဉ်" value={formData.title} onChange={handleChange} required />
        <textarea name="description" placeholder="အကျဉ်းချုပ်" value={formData.description} onChange={handleChange} required />
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="movie">Movie</option>
          <option value="story">Story</option>
        </select>
        <input name="genre" placeholder="အမျိုးအစား" value={formData.genre} onChange={handleChange} />
        <input name="rating" placeholder="Rating (e.g. 8.5)" value={formData.rating} onChange={handleChange} />
        <input name="videoUrl" placeholder="Video Link" value={formData.videoUrl} onChange={handleChange} />
        <input name="downloadUrl" placeholder="Download Link" value={formData.downloadUrl} onChange={handleChange} />
        <div className="file-input-group">
          <label>Poster ပုံ ရွေးရန်:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} required />
        </div>
        <button type="submit">တင်မည်</button>
      </form>

      <hr />
      <h3>Manage Contents</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {contents.map(item => (
            <tr key={item._id}>
              <td>{item.title}</td>
              <td>{item.type}</td>
              <td>
                <button onClick={() => deleteContent(item._id)} className="btn-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function App() {
  const [contents, setContents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const fetchContents = () => {
    axios.get('http://localhost:5000/api/contents/all').then(res => setContents(res.data));
  };

  useEffect(() => { fetchContents(); }, []);

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <Link to="/" className="nav-logo"><h1>Movie&Story App</h1></Link>
          <div className="nav-right">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/admin" className="nav-link">Admin</Link>
            <div className={`search-container ${isSearchOpen ? 'open' : ''}`}>
              <i className={`fas nav-search-icon ${isSearchOpen ? 'fa-times' : 'fa-search'}`}
                onClick={() => setIsSearchOpen(!isSearchOpen)}></i>
              <input type="text" placeholder="ရှာရန်..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} className="nav-search-input" />
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home contents={contents} searchTerm={searchTerm} />} />
          <Route path="/admin" element={<Admin contents={contents} fetchContents={fetchContents} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;