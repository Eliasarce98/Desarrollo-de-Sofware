import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importamos todas las páginas que ya creaste en la carpeta /pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import BookingPage from './pages/BookingPage';

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
        
        {/* Ruta para comprar entradas (el :movieId cambia según la película) */}
        <Route path="/booking/:movieId" element={<BookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;