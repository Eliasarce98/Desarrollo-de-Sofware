import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('movies');
  
  // Datos
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  // Estado para Edición (Si tiene ID, estamos editando)
  const [editingId, setEditingId] = useState(null);

  // Formularios
  const [newMovie, setNewMovie] = useState({ title: '', genre: '', image: '' });
  const [newHall, setNewHall] = useState({ name: '', rows: 10, cols: 8 });
  const [newShowtime, setNewShowtime] = useState({ movie_id: '', hall_id: '', start_time: '', price: 1500 });

  useEffect(() => {
    const userStored = localStorage.getItem('usuario_cine');
    if (!userStored) { navigate('/login'); return; }
    const user = JSON.parse(userStored);
    if (user.role !== 'admin') { alert("⚠️ Acceso Denegado"); navigate('/'); return; }
    fetchData();
  }, []);

  const fetchData = () => {
    fetch('http://localhost:3000/api/movies').then(res => res.json()).then(setMovies);
    fetch('http://localhost:3000/api/halls').then(res => res.json()).then(setHalls);
    fetch('http://localhost:3000/api/showtimes').then(res => res.json()).then(setShowtimes);
  };

  // --- LOGICA PELICULAS ---
  const handleEditMovie = (movie) => {
    setEditingId(movie.id);
    setNewMovie(movie);
  };
  const handleCancelMovie = () => {
    setEditingId(null);
    setNewMovie({ title: '', genre: '', image: '' });
  };
  const handleSaveMovie = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `http://localhost:3000/api/movies/${editingId}` : 'http://localhost:3000/api/movies';
    
    await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newMovie) });
    fetchData();
    handleCancelMovie();
  };
  const handleDeleteMovie = async (id) => {
    if(confirm("¿Borrar?")) { await fetch(`http://localhost:3000/api/movies/${id}`, { method: 'DELETE' }); fetchData(); }
  };

  // --- LOGICA SALAS ---
  const handleEditHall = (hall) => {
    setEditingId(hall.id);
    setNewHall(hall);
  };
  const handleCancelHall = () => {
    setEditingId(null);
    setNewHall({ name: '', rows: 10, cols: 8 });
  };
  const handleSaveHall = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `http://localhost:3000/api/halls/${editingId}` : 'http://localhost:3000/api/halls';

    await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newHall) });
    fetchData();
    handleCancelHall();
  };
  const handleDeleteHall = async (id) => {
    if(confirm("¿Borrar?")) { await fetch(`http://localhost:3000/api/halls/${id}`, { method: 'DELETE' }); fetchData(); }
  };

  // --- LOGICA FUNCIONES ---
  const handleEditShowtime = (st) => {
    setEditingId(st.id);
    // Formatear fecha para el input datetime-local (YYYY-MM-DDTHH:mm)
    const formattedDate = new Date(st.start_time).toISOString().slice(0, 16);
    setNewShowtime({ 
        movie_id: st.movie_id, 
        hall_id: st.hall_id, 
        start_time: formattedDate, 
        price: st.price 
    });
  };
  const handleCancelShowtime = () => {
    setEditingId(null);
    setNewShowtime({ movie_id: '', hall_id: '', start_time: '', price: 1500 });
  };
  const handleSaveShowtime = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `http://localhost:3000/api/showtimes/${editingId}` : 'http://localhost:3000/api/showtimes';

    await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newShowtime) });
    fetchData();
    handleCancelShowtime();
  };
  const handleDeleteShowtime = async (id) => {
    if(confirm("¿Borrar?")) { await fetch(`http://localhost:3000/api/showtimes/${id}`, { method: 'DELETE' }); fetchData(); }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex font-sans">
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col fixed h-full">
        <div className="p-6 text-center border-b border-gray-700"><h2 className="text-2xl font-bold text-yellow-500 tracking-wider">PANEL ADMIN</h2></div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => {setActiveTab('movies'); handleCancelMovie()}} className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'movies' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>🎬 Películas</button>
          <button onClick={() => {setActiveTab('halls'); handleCancelHall()}} className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'halls' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>💺 Salas</button>
          <button onClick={() => {setActiveTab('showtimes'); handleCancelShowtime()}} className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'showtimes' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>📅 Funciones</button>
        </nav>
        <div className="p-4 border-t border-gray-700"><button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-sm">← Volver al Sitio</button></div>
      </aside>

      <main className="flex-1 ml-64 p-8 bg-gray-900">
        
        {/* --- VISTA PELICULAS --- */}
        {activeTab === 'movies' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`p-6 rounded-lg shadow-lg h-fit ${editingId ? 'bg-yellow-900/20 border border-yellow-600' : 'bg-gray-800'}`}>
                <h3 className="text-xl font-bold mb-4 text-green-400">{editingId ? 'Editar Película' : 'Nueva Película'}</h3>
                <form onSubmit={handleSaveMovie} className="space-y-4">
                    <input className="w-full bg-gray-700 border-gray-600 rounded p-2" placeholder="Título" value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} required />
                    <input className="w-full bg-gray-700 border-gray-600 rounded p-2" placeholder="Género" value={newMovie.genre} onChange={e => setNewMovie({...newMovie, genre: e.target.value})} required />
                    <input className="w-full bg-gray-700 border-gray-600 rounded p-2" placeholder="URL Imagen" value={newMovie.image} onChange={e => setNewMovie({...newMovie, image: e.target.value})} required />
                    
                    <div className="flex gap-2">
                        <button className={`w-full py-2 rounded font-bold ${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>
                            {editingId ? 'Actualizar' : 'Guardar'}
                        </button>
                        {editingId && <button type="button" onClick={handleCancelMovie} className="px-4 bg-gray-600 hover:bg-gray-500 rounded">X</button>}
                    </div>
                </form>
            </div>
            <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300"><tr><th className="p-4">Póster</th><th className="p-4">Título</th><th className="p-4">Acciones</th></tr></thead>
                    <tbody className="divide-y divide-gray-700">
                        {movies.map(m => (
                            <tr key={m.id} className="hover:bg-gray-700/50">
                                <td className="p-4"><img src={m.image} className="w-10 h-14 object-cover rounded" onError={(e) => e.target.src = "https://via.placeholder.com/50"} /></td>
                                <td className="p-4 font-bold">{m.title}<br/><span className="text-xs text-gray-400">{m.genre}</span></td>
                                <td className="p-4 space-x-2">
                                    <button onClick={() => handleEditMovie(m)} className="text-blue-400 hover:text-blue-300 bg-blue-900/20 px-3 py-1 rounded text-sm">Editar</button>
                                    <button onClick={() => handleDeleteMovie(m.id)} className="text-red-400 hover:text-red-300 bg-red-900/20 px-3 py-1 rounded text-sm">Borrar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* --- VISTA SALAS --- */}
        {activeTab === 'halls' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`p-6 rounded-lg shadow-lg h-fit ${editingId ? 'bg-yellow-900/20 border border-yellow-600' : 'bg-gray-800'}`}>
                <h3 className="text-xl font-bold mb-4 text-red-400">{editingId ? 'Editar Sala' : 'Nueva Sala'}</h3>
                <form onSubmit={handleSaveHall} className="space-y-4">
                    <input className="w-full bg-gray-700 border-gray-600 rounded p-2" placeholder="Nombre" value={newHall.name} onChange={e => setNewHall({...newHall, name: e.target.value})} required />
                    <div className="flex gap-2">
                        <input type="number" className="w-1/2 bg-gray-700 border-gray-600 rounded p-2" placeholder="Filas" value={newHall.rows} onChange={e => setNewHall({...newHall, rows: e.target.value})} required />
                        <input type="number" className="w-1/2 bg-gray-700 border-gray-600 rounded p-2" placeholder="Cols" value={newHall.cols} onChange={e => setNewHall({...newHall, cols: e.target.value})} required />
                    </div>
                    <div className="flex gap-2">
                        <button className={`w-full py-2 rounded font-bold ${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>{editingId ? 'Actualizar' : 'Crear'}</button>
                        {editingId && <button type="button" onClick={handleCancelHall} className="px-4 bg-gray-600 hover:bg-gray-500 rounded">X</button>}
                    </div>
                </form>
            </div>
            <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300"><tr><th className="p-4">Nombre</th><th className="p-4">Capacidad</th><th className="p-4">Acciones</th></tr></thead>
                    <tbody className="divide-y divide-gray-700">
                        {halls.map(h => (
                            <tr key={h.id} className="hover:bg-gray-700/50">
                                <td className="p-4 font-bold">{h.name}</td>
                                <td className="p-4">{h.rows * h.cols} butacas</td>
                                <td className="p-4 space-x-2">
                                    <button onClick={() => handleEditHall(h)} className="text-blue-400 bg-blue-900/20 px-3 py-1 rounded text-sm">Editar</button>
                                    <button onClick={() => handleDeleteHall(h.id)} className="text-red-400 bg-red-900/30 px-3 py-1 rounded text-sm">Borrar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* --- VISTA FUNCIONES --- */}
        {activeTab === 'showtimes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className={`p-6 rounded-lg shadow-lg h-fit ${editingId ? 'bg-yellow-900/20 border border-yellow-600' : 'bg-gray-800'}`}>
                <h3 className="text-xl font-bold mb-4 text-blue-400">{editingId ? 'Editar Función' : 'Programar'}</h3>
                <form onSubmit={handleSaveShowtime} className="space-y-4">
                    <select className="w-full bg-gray-700 border-gray-600 rounded p-2" value={newShowtime.movie_id} onChange={e => setNewShowtime({...newShowtime, movie_id: e.target.value})} required>
                        <option value="">Película</option>{movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                    <select className="w-full bg-gray-700 border-gray-600 rounded p-2" value={newShowtime.hall_id} onChange={e => setNewShowtime({...newShowtime, hall_id: e.target.value})} required>
                        <option value="">Sala</option>{halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                    <input type="datetime-local" className="w-full bg-gray-700 border-gray-600 rounded p-2 text-white scheme-dark" value={newShowtime.start_time} onChange={e => setNewShowtime({...newShowtime, start_time: e.target.value})} required />
                    <input type="number" className="w-full bg-gray-700 border-gray-600 rounded p-2" placeholder="Precio" value={newShowtime.price} onChange={e => setNewShowtime({...newShowtime, price: e.target.value})} required />
                    
                    <div className="flex gap-2">
                        <button className={`w-full py-2 rounded font-bold ${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{editingId ? 'Actualizar' : 'Guardar'}</button>
                        {editingId && <button type="button" onClick={handleCancelShowtime} className="px-4 bg-gray-600 hover:bg-gray-500 rounded">X</button>}
                    </div>
                </form>
             </div>
             <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300"><tr><th className="p-4">Fecha</th><th className="p-4">Info</th><th className="p-4">Acciones</th></tr></thead>
                    <tbody className="divide-y divide-gray-700">
                        {showtimes.map(st => (
                            <tr key={st.id} className="hover:bg-gray-700/50">
                                <td className="p-4 text-yellow-400 font-bold">{new Date(st.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}<br/><span className="text-gray-400 text-xs">{new Date(st.start_time).toLocaleDateString()}</span></td>
                                <td className="p-4">{st.Movie?.title}<br/><span className="text-gray-400 text-xs">{st.Hall?.name}</span></td>
                                <td className="p-4 space-x-2">
                                    <button onClick={() => handleEditShowtime(st)} className="text-blue-400 bg-blue-900/20 px-3 py-1 rounded text-sm">Editar</button>
                                    <button onClick={() => handleDeleteShowtime(st.id)} className="text-red-400 bg-red-900/30 px-3 py-1 rounded text-sm">X</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}