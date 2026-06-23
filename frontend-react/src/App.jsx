import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import HomePage from './components/HomePage';
import VideoDetail from './components/VideoDetail';
import NewsPage from './components/NewsPage';
import NewsDetail from './components/NewsDetail';
import ContactPage from './components/ContactPage';
import IntroPage from './components/IntroPage';
import GalleryPage from './components/GalleryPage';
import AddVideoModal from './components/AddVideoModal';
import AdminPanel from './components/AdminPanel';
import Dashboard from './components/Dashboard';
import './index.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('home');
  const [videoId, setVideoId] = useState(null);
  const [newsId, setNewsId] = useState(null);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const navigate = useCallback((v) => {
    setView(v);
    setVideoId(null);
    setNewsId(null);
    if (v === 'add-video') { setShowAddVideo(true); return; }
    if (v === 'admin') { setShowAdmin(true); return; }
  }, []);

  const openVideo = useCallback((id) => { setView('video-detail'); setVideoId(id); }, []);
  const openNews = useCallback((id) => { setView('news-detail'); setNewsId(id); }, []);
  const goBack = useCallback(() => { setView('home'); setVideoId(null); setNewsId(null); }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner"></div></div>;

  if (!user) return <LoginPage />;

  return (
    <div id="app-main" className="logged-in">
      <Header currentView={view} onNavigate={navigate} />
      <main className="main">
        <div className="container">
          {view === 'home' && <HomePage onViewVideo={openVideo} onViewNews={openNews} />}
          {view === 'video-detail' && videoId && <VideoDetail videoId={videoId} onBack={goBack} />}
          {view === 'news' && <NewsPage onViewNews={openNews} />}
          {view === 'news-detail' && newsId && <NewsDetail newsId={newsId} onBack={() => setView('news')} />}
          {view === 'contact' && <ContactPage />}
          {view === 'intro' && <IntroPage />}
          {view === 'gallery' && <GalleryPage />}
          {view === 'dashboard' && <Dashboard onBack={goBack} />}
        </div>
      </main>
      <footer className="footer">
        <div className="container">© 2024 波比 — 集团视频展示平台 🏛️</div>
      </footer>

      {showAddVideo && <AddVideoModal onClose={() => setShowAddVideo(false)} onSuccess={() => setView('home')} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
