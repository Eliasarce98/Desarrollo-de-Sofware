import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('movies'); // Controla qué sección vemos: 'movies', 'halls', 'showtimes'
  const [movies, setMovies] = useState([]);

  // --- 1. SEGURIDAD: Verificar si es Admin al entrar ---
  useEffect(() => {
    const userStored = localStorage.getItem('usuario_cine');
    
    if (!userStored) {
      navigate('/login'); // Si no hay usuario, fuera
      return;
    }

    const user = JSON.parse(userStored);
    if (user.role !== 'admin') {
      alert("⚠️ Acceso Denegado: Se requieren permisos de Administrador.");
      navigate('/'); // Si no es admin, fuera
      return;
    }

    // Si pasó la seguridad, cargamos los datos
    fetchMovies();
  }, []);

  // Función para traer películas del backend
  const fetchMovies = () => {
    fetch('http://localhost:3000/api/movies')
      .then(res => res.json())
      .then(data => setMovies(data))
      .catch(err => console.error(err));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex font-sans">
      
      {/* --- SIDEBAR (Menú Lateral) --- */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col fixed h-full">
        <div className="p-6 text-center border-b border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-500 tracking-wider">PANEL ADMIN</h2>
          <p className="text-xs text-gray-400 mt-1">Gestión Cinetix</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('movies')}
            className={`w-full text-left px-4 py-3 rounded transition flex items-center gap-3 ${activeTab === 'movies' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            🎬 Películas
          </button>
          <button 
            onClick={() => setActiveTab('halls')}
            className={`w-full text-left px-4 py-3 rounded transition flex items-center gap-3 ${activeTab === 'halls' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            💺 Salas
          </button>
          <button 
            onClick={() => setActiveTab('showtimes')}
            className={`w-full text-left px-4 py-3 rounded transition flex items-center gap-3 ${activeTab === 'showtimes' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            📅 Funciones
          </button>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
            ← Volver al Sitio
          </button>
        </div>
      </aside>

      {/* --- ÁREA DE CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 ml-64 p-8 bg-gray-900">
        
        {/* VISTA: GESTIÓN DE PELÍCULAS */}
        {activeTab === 'movies' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold border-l-4 border-yellow-500 pl-4">Gestión de Películas</h2>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow-lg transition transform hover:scale-105">
                + Nueva Película
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-700">
              <table className="w-full text-left">
                <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Póster</th>
                    <th className="p-4">Título</th>
                    <th className="p-4">Género</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {movies.map(movie => (
                    <tr key={movie.id} className="hover:bg-gray-700/50 transition">
                      <td className="p-4 text-gray-400">#{movie.id}</td>
                      <td className="p-4">
                        <img src={movie.image} alt="poster" className="w-12 h-16 object-cover rounded shadow-md" />
                      </td>
                      <td className="p-4 font-bold text-lg">{movie.title}</td>
                      <td className="p-4 text-gray-400">
                        <span className="bg-gray-900 px-2 py-1 rounded text-xs border border-gray-600">
                          {movie.genre}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-3">
                        <button className="text-blue-400 hover:text-blue-300 font-medium transition">Editar</button>
                        <button className="text-red-400 hover:text-red-300 font-medium transition">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {movies.length === 0 && (
                <div className="p-8 text-center text-gray-500">No hay películas cargadas aún.</div>
              )}
            </div>
          </div>
        )}

        {/* VISTA: GESTIÓN DE SALAS (Placeholder) */}
        {activeTab === 'halls' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-fade-in">
            <span className="text-6xl mb-4">💺</span>
            <h2 className="text-3xl font-bold mb-2">Gestión de Salas</h2>
            <p>Aquí diseñaremos la matriz de asientos y sucursales.</p>
            <button className="mt-6 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Crear Primera Sala</button>
          </div>
        )}

        {/* VISTA: GESTIÓN DE FUNCIONES (Placeholder) */}
        {activeTab === 'showtimes' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-fade-in">
            <span className="text-6xl mb-4">📅</span>
            <h2 className="text-3xl font-bold mb-2">Programación</h2>
            <p>Aquí asignaremos Películas a Salas en horarios específicos.</p>
          </div>
        )}

      </main>
    </div>
  );
}