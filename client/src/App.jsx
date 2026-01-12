import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importamos las 3 páginas que tenemos hasta ahora
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard'; // <--- Lo nuevo

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública: Cartelera */}
        <Route path="/" element={<HomePage />} />
        
        {/* Ruta Pública: Login/Registro */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Ruta Privada: Panel de Administración */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;