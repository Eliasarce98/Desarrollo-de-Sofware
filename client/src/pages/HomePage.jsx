import React from 'react';

// Datos de prueba (Simulando la Base de Datos)
const PELICULAS = [
  { 
    id: 1, 
    titulo: "Oppenheimer", 
    genero: "Drama / Historia", 
    img: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" 
  },
  { 
    id: 2, 
    titulo: "Barbie", 
    genero: "Comedia / Fantasía", 
    img: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg" 
  },
  { 
    id: 3, 
    titulo: "Avatar: El Camino del Agua", 
    genero: "Ciencia Ficción", 
    img: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg" 
  },
  { 
    id: 4, 
    titulo: "Super Mario Bros", 
    genero: "Animación", 
    img: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg" 
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* --- NAVBAR (Barra de Navegación) --- */}
      <nav className="bg-gray-800 border-b border-red-600 px-6 py-4 shadow-xl flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-4xl">🍿</span>
          <h1 className="text-2xl font-bold tracking-wider text-red-500 hover:text-red-400 transition cursor-pointer">
            CINE UTN
          </h1>
        </div>
        
        <div className="flex gap-4">
          <button className="text-gray-300 hover:text-white font-medium transition">
            Cartelera
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold transition shadow-lg hover:shadow-red-500/30">
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="container mx-auto px-4 py-10">
        
        {/* Título de la sección */}
        <div className="flex items-center mb-8">
          <div className="w-2 h-10 bg-red-600 mr-4 rounded-sm"></div>
          <h2 className="text-4xl font-bold uppercase tracking-wide">
            En Cartelera Hoy
          </h2>
        </div>

        {/* --- GRILLA DE PELÍCULAS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {PELICULAS.map((peli) => (
            <div 
              key={peli.id} 
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-red-900/20 transform hover:-translate-y-2 transition duration-300 group cursor-pointer"
            >
              {/* Imagen */}
              <div className="overflow-hidden relative h-[400px]">
                <img 
                  src={peli.img} 
                  alt={peli.titulo} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 font-bold border-2 border-white px-4 py-2 rounded-lg backdrop-blur-sm">
                    Ver Horarios
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-1 truncate">{peli.titulo}</h3>
                <p className="text-gray-400 text-sm mb-4">{peli.genero}</p>
                
                <button className="w-full bg-gray-700 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2">
                  <span>🎟️</span> Comprar Entradas
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 text-center py-8 mt-12 border-t border-gray-800">
        <p>© 2026 Cine UTN Rosario - Desarrollo de Software</p>
      </footer>
    </div>
  );
}