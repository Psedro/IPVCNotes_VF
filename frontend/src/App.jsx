import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FolderView from './pages/FolderView';
import NoteEditor from './pages/NoteEditor';
import './styles/global.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

import PublicSpace from './pages/PublicSpace';
import Notifications from './pages/Notifications';
import Layout from './components/Layout';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />

      <Route path="/public" element={
        <PrivateRoute>
          <Layout>
            <PublicSpace />
          </Layout>
        </PrivateRoute>
      } />

      <Route path="/notifications" element={
        <PrivateRoute>
          <Layout>
            <Notifications />
          </Layout>
        </PrivateRoute>
      } />

      <Route path="/pasta/:id" element={
        <PrivateRoute>
          <Layout>
            <FolderView />
          </Layout>
        </PrivateRoute>
      } />

      <Route path="/nota/:id" element={
        <PrivateRoute>
          <Layout>
            <NoteEditor />
          </Layout>
        </PrivateRoute>
      } />

    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
