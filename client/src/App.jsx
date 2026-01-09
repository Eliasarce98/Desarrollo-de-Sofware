import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- COMPONENTE HOMEPAGE (Conectado al Backend) ---
function HomePage() {
  // 1. Estado para guardar las películas que vienen del Backend
  const [peliculas, setPeliculas] = useState([]);

  // 2. useEffect: Se ejecuta una sola vez cuando carga la página
  useEffect(() => {
    // "Fetch" hace la llamada telefónica a tu Backend
    fetch('http://localhost:3000/api/movies')
      .then(response => response.json()) // Convertimos la respuesta a JSON
      .then(data => {
        console.log("Películas recibidas:", data);
        setPeliculas(data); // Guardamos los datos en el estado
      })
      .catch(error => console.error("Error conectando con el servidor:", error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navbar */}
      <nav className="bg-gray-800 border-b border-red-600 px-6 py-4 shadow-xl flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-4xl">🍿</span>
          <h1 className="text-2xl font-bold tracking-wider text-red-500 hover:text-red-400 transition cursor-pointer">
            CINE UTN
          </h1>
        </div>
        <div className="flex gap-4">
          <button className="text-gray-300 hover:text-white font-medium transition">Cartelera</button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold transition shadow-lg hover:shadow-red-500/30">
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center mb-8">
          <div className="w-2 h-10 bg-red-600 mr-4 rounded-sm"></div>
          <h2 className="text-4xl font-bold uppercase tracking-wide">En Cartelera Hoy</h2>
        </div>

        {/* --- GRILLA DINÁMICA --- */}
        {/* Si la lista está vacía, mostramos "Cargando..." */}
        {peliculas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">Cargando películas...</p>
            <p className="text-sm text-gray-600 mt-2">
              (Si esto no carga, asegúrate de haber visitado http://localhost:3000/api/seed una vez)
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {peliculas.map((peli) => (
              <div key={peli.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-red-900/20 transform hover:-translate-y-2 transition duration-300 group cursor-pointer">
                <div className="overflow-hidden relative h-[400px]">
                  <img 
                    src={peli.image} 
                    alt={peli.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    // Si la imagen falla (URL rota), mostramos un cuadrado gris
                    onError={(e) => e.target.src = "https://via.placeholder.com/300x450?text=Sin+Imagen"} 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 font-bold border-2 border-white px-4 py-2 rounded-lg backdrop-blur-sm">Ver Horarios</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-1 truncate">{peli.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{peli.genre}</p>
                  <button className="w-full bg-gray-700 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2">
                    <span>🎟️</span> Comprar Entradas
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <footer className="bg-gray-950 text-gray-500 text-center py-8 mt-12 border-t border-gray-800">
        <p>© 2026 Cine UTN Rosario - Desarrollo de Software</p>
      </footer>
    </div>
  );
}

// --- APP PRINCIPAL ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;