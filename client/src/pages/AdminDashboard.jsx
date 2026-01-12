import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  
  // --- ESTADOS PARA SALAS ---
  const [halls, setHalls] = useState([]);
  const [newHall, setNewHall] = useState({ name: '', rows: 10, cols: 8 });

  useEffect(() => {
    const userStored = localStorage.getItem('usuario_cine');
    
    if (!userStored) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStored);
    if (user.role !== 'admin') {
      alert("⚠️ Acceso Denegado: Se requieren permisos de Administrador.");
      navigate('/');
      return;
    }

    // Cargar datos iniciales
    fetchMovies();
    fetchHalls();
  }, []);

  const fetchMovies = () => {
    fetch('http://localhost:3000/api/movies')
      .then(res => res.json())
      .then(data => setMovies(data))
      .catch(err => console.error(err));
  };

  const fetchHalls = () => {
    fetch('http://localhost:3000/api/halls')
      .then(res => res.json())
      .then(data => setHalls(data))
      .catch(err => console.error(err));
  };

  // --- LÓGICA PARA CREAR SALA ---
  const handleCreateHall = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/halls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHall)
      });
      if (res.ok) {
        alert("¡Sala creada!");
        fetchHalls(); // Recargar lista
        setNewHall({ name: '', rows: 10, cols: 8 }); // Limpiar form
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteHall = async (id) => {
    if(!confirm("¿Seguro que quieres borrar esta sala?")) return;
    try {
        await fetch(`http://localhost:3000/api/halls/${id}`, { method: 'DELETE' });
        fetchHalls();
    } catch(err) { console.error(err) }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex font-sans">
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col fixed h-full">
        <div className="p-6 text-center border-b border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-500 tracking-wider">PANEL ADMIN</h2>
          <p className="text-xs text-gray-400 mt-1">Gestión Cinetix</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('movies')} className={`w-full text-left px-4 py-3 rounded transition flex items-center gap-3 ${activeTab === 'movies' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
            🎬 Películas
          </button>
          <button onClick={() => setActiveTab('halls')} className={`w-full text-left px-4 py-3 rounded transition flex items-center gap-3 ${activeTab === 'halls' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
            💺 Salas
          </button>
          <button onClick={() => setActiveTab('showtimes')} className={`w-full text-left px-4 py-3 rounded transition flex items-center gap-3 ${activeTab === 'showtimes' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
            📅 Funciones
          </button>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
            ← Volver al Sitio
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 bg-gray-900">
        
        {/* VISTA: PELÍCULAS */}
        {activeTab === 'movies' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-yellow-500 pl-4">Gestión de Películas</h2>
            <div className="bg-gray-800 rounded-lg p-4">
               {/* Aquí podrías agregar el formulario de películas más adelante */}
               <p className="text-gray-400 mb-4">Películas cargadas en el sistema:</p>
               <div className="grid grid-cols-4 gap-4">
                 {movies.map(m => (
                    <div key={m.id} className="bg-gray-700 p-2 rounded text-center">
                        <img src={m.image} className="w-full h-32 object-cover rounded mb-2" />
                        <h4 className="font-bold text-sm truncate">{m.title}</h4>
                    </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* VISTA: SALAS (¡AHORA FUNCIONA!) */}
        {activeTab === 'halls' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-yellow-500 pl-4">Gestión de Salas</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulario de Creación */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
                <h3 className="text-xl font-bold mb-4 text-red-400">Nueva Sala</h3>
                <form onSubmit={handleCreateHall} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                    <input 
                      type="text" 
                      value={newHall.name}
                      onChange={e => setNewHall({...newHall, name: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:border-red-500 outline-none"
                      placeholder="Ej: Sala 1"
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Filas</label>
                        <input 
                        type="number" min="1" max="20"
                        value={newHall.rows}
                        onChange={e => setNewHall({...newHall, rows: parseInt(e.target.value)})}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 outline-none"
                        required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Asientos x Fila</label>
                        <input 
                        type="number" min="1" max="20"
                        value={newHall.cols}
                        onChange={e => setNewHall({...newHall, cols: parseInt(e.target.value)})}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 outline-none"
                        required 
                        />
                    </div>
                  </div>
                  
                  {/* Previsualización mini */}
                  <div className="mt-4 p-4 bg-gray-900 rounded text-center">
                    <p className="text-xs text-gray-500 mb-2">Capacidad: {newHall.rows * newHall.cols} personas</p>
                    <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${newHall.cols}, 1fr)`}}>
                        {Array.from({ length: Math.min(newHall.rows * newHall.cols, 50) }).map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-gray-600 rounded-sm"></div>
                        ))}
                    </div>
                    {newHall.rows * newHall.cols > 50 && <p className="text-xs text-gray-600 mt-1">...</p>}
                  </div>

                  <button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold">
                    Crear Sala
                  </button>
                </form>
              </div>

              {/* Lista de Salas */}
              <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <table className="w-full text-left">
                  <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
                    <tr>
                      <th className="p-4">Sala</th>
                      <th className="p-4">Dimensiones</th>
                      <th className="p-4">Capacidad</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {halls.map(hall => (
                      <tr key={hall.id} className="hover:bg-gray-700/50">
                        <td className="p-4 font-bold">{hall.name}</td>
                        <td className="p-4 text-gray-400">{hall.rows} filas x {hall.cols} as.</td>
                        <td className="p-4 font-mono text-yellow-500">{hall.rows * hall.cols} pax</td>
                        <td className="p-4 text-center">
                            <button 
                                onClick={() => handleDeleteHall(hall.id)}
                                className="text-red-400 hover:text-red-300 text-sm bg-red-900/30 px-3 py-1 rounded"
                            >
                                Eliminar
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {halls.length === 0 && (
                    <div className="p-10 text-center text-gray-500">
                        No hay salas creadas. ¡Crea la primera!
                    </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VISTA: FUNCIONES */}
        {activeTab === 'showtimes' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-fade-in">
             <span className="text-6xl mb-4">📅</span>
             <h2 className="text-3xl font-bold mb-2">Próximamente...</h2>
             <p>Primero crea salas para poder asignar funciones.</p>
          </div>
        )}

      </main>
    </div>
  );
}