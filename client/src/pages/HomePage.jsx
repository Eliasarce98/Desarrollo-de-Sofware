import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [peliculas, setPeliculas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar Películas
    fetch('http://localhost:3000/api/movies')
      .then(response => response.json())
      .then(data => setPeliculas(data))
      .catch(error => console.error(error));

    // Verificar Usuario
    const userStored = localStorage.getItem('usuario_cine');
    if (userStored) {
      setUsuario(JSON.parse(userStored));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuario_cine');
    setUsuario(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navbar */}
      <nav className="bg-gray-800 border-b border-red-600 px-6 py-4 shadow-xl flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-4xl">🎬</span>
          <h1 className="text-2xl font-bold tracking-wider text-red-500 italic">CINETIX</h1>
        </div>
        
        <div className="flex gap-4 items-center">
          {usuario ? (
            <>
              <span className="text-gray-300 hidden sm:inline">Hola, <b className="text-white">{usuario.name}</b></span>
              {usuario.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-bold transition flex items-center gap-2"
                >
                  ⚙️ <span className="hidden sm:inline">Admin</span>
                </button>
              )}
              <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 underline ml-2">
                Salir
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold transition shadow-lg"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center mb-8">
          <div className="w-2 h-10 bg-red-600 mr-4 rounded-sm"></div>
          <h2 className="text-4xl font-bold uppercase tracking-wide">En Cartelera Hoy</h2>
        </div>

        {peliculas.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">Cargando películas...</p>
            <p className="text-sm mt-2">(Asegúrate de que el backend esté corriendo en puerto 3000)</p>
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
                    onError={(e) => e.target.src = "https://via.placeholder.com/300x450?text=Sin+Imagen"} 
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-1 truncate">{peli.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{peli.genre}</p>
                  
                  {/* AQUÍ ESTÁ EL CAMBIO CLAVE: Botón con redirección a /booking */}
                  <button 
                    onClick={() => navigate(`/booking/${peli.id}`)}
                    className="w-full bg-gray-700 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <span>🎟️</span> Comprar Entradas
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}