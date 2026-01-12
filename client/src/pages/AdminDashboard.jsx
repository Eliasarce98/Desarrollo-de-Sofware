import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('movies');
  
  // Datos
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  // Formularios
  const [newMovie, setNewMovie] = useState({ title: '', genre: '', image: '' });
  const [newHall, setNewHall] = useState({ name: '', rows: 10, cols: 8 });
  const [newShowtime, setNewShowtime] = useState({ movie_id: '', hall_id: '', start_time: '', price: 1500 });

  // 1. SEGURIDAD: Verificar si es Admin
  useEffect(() => {
    const userStored = localStorage.getItem('usuario_cine');
    
    if (!userStored) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStored);
    if (user.role !== 'admin') {
      alert("⚠️ Acceso Denegado: Solo admins.");
      navigate('/');
      return;
    }

    // Cargar todo
    fetchMovies();
    fetchHalls();
    fetchShowtimes();
  }, []);

  // --- FUNCIONES DE CARGA ---
  const fetchMovies = () => fetch('http://localhost:3000/api/movies').then(res => res.json()).then(setMovies);
  const fetchHalls = () => fetch('http://localhost:3000/api/halls').then(res => res.json()).then(setHalls);
  const fetchShowtimes = () => fetch('http://localhost:3000/api/showtimes').then(res => res.json()).then(setShowtimes);

  // --- LÓGICA PELÍCULAS ---
  const handleCreateMovie = async (e) => {
    e.preventDefault();
    if(confirm("¿Guardar película?")) {
        await fetch('http://localhost:3000/api/movies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMovie)
        });
        fetchMovies();
        setNewMovie({ title: '', genre: '', image: '' });
    }
  };

  const handleDeleteMovie = async (id) => {
    if(confirm("¿Seguro que quieres borrar esta película?")) {
        await fetch(`http://localhost:3000/api/movies/${id}`, { method: 'DELETE' });
        fetchMovies(); // Recargamos la lista para que desaparezca
    }
  };

  // --- LÓGICA SALAS ---
  const handleCreateHall = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/halls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHall)
    });
    fetchHalls();
    alert("Sala creada");
  };

  const handleDeleteHall = async (id) => {
    if(confirm("¿Borrar sala?")) {
        await fetch(`http://localhost:3000/api/halls/${id}`, { method: 'DELETE' });
        fetchHalls();
    }
  };

  // --- LÓGICA FUNCIONES ---
  const handleCreateShowtime = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/showtimes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShowtime)
    });
    fetchShowtimes();
    alert("Función creada");
  };

  const handleDeleteShowtime = async (id) => {
    if(confirm("¿Borrar función?")) {
        await fetch(`http://localhost:3000/api/showtimes/${id}`, { method: 'DELETE' });
        fetchShowtimes();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex font-sans">
      
      {/* MENÚ LATERAL */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col fixed h-full">
        <div className="p-6 text-center border-b border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-500 tracking-wider">PANEL ADMIN</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('movies')} className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'movies' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>🎬 Películas</button>
          <button onClick={() => setActiveTab('halls')} className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'halls' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>💺 Salas</button>
          <button onClick={() => setActiveTab('showtimes')} className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'showtimes' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>📅 Funciones</button>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-sm">← Volver al Sitio</button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 ml-64 p-8 bg-gray-900">
        
        {/* --- PESTAÑA PELÍCULAS --- */}
        {activeTab === 'movies' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Formulario */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
                <h3 className="text-xl font-bold mb-4 text-green-400">Nueva Película</h3>
                <form onSubmit={handleCreateMovie} className="space-y-4">
                    <input className="w-full bg-gray-700 border-gray-600 rounded p-2" placeholder="Título" value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} required />
                    <input className="w-full bg-gray-700 border-gray-600 rounded p-2" placeholder="Género" value={newMovie.genre} onChange={e => setNewMovie({...newMovie, genre: e.target.value})} required />
                    <input className="w-full bg-gray-700 border-gray-600 rounded p-2" placeholder="URL Imagen" value={newMovie.image} onChange={e => setNewMovie({...newMovie, image: e.target.value})} required />
                    <button className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold">Guardar</button>
                </form>
            </div>
            
            {/* Lista (Ahora con botón Borrar) */}
            <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr><th className="p-4">Póster</th><th className="p-4">Título</th><th className="p-4">Acción</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {movies.map(m => (
                            <tr key={m.id} className="hover:bg-gray-700/50">
                                <td className="p-4"><img src={m.image} className="w-10 h-14 object-cover rounded" /></td>
                                <td className="p-4 font-bold">{m.title}<br/><span className="text-xs text-gray-400">{m.genre}</span></td>
                                <td className="p-4">
                                    <button onClick={() => handleDeleteMovie(m.id)} className="text-red-400 hover:text-red-300 bg-red-900/30 px-3 py-1 rounded text-sm">Borrar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* --- PESTAÑA SALAS --- */}
        {activeTab === 'halls' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
                <h3 className="text-xl font-bold mb-4 text-red-400">Nueva Sala</h3>
                <form onSubmit={handleCreateHall} className="space-y-4">
                    <input className="w-full bg-gray-700 border-gray-600 rounded p-2" placeholder="Nombre (Ej: Sala 1)" value={newHall.name} onChange={e => setNewHall({...newHall, name: e.target.value})} required />
                    <div className="flex gap-2">
                        <input type="number" className="w-1/2 bg-gray-700 border-gray-600 rounded p-2" placeholder="Filas" value={newHall.rows} onChange={e => setNewHall({...newHall, rows: e.target.value})} required />
                        <input type="number" className="w-1/2 bg-gray-700 border-gray-600 rounded p-2" placeholder="Asientos" value={newHall.cols} onChange={e => setNewHall({...newHall, cols: e.target.value})} required />
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold">Crear Sala</button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr><th className="p-4">Nombre</th><th className="p-4">Capacidad</th><th className="p-4">Acción</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {halls.map(h => (
                            <tr key={h.id} className="hover:bg-gray-700/50">
                                <td className="p-4 font-bold">{h.name}</td>
                                <td className="p-4">{h.rows * h.cols} butacas</td>
                                <td className="p-4"><button onClick={() => handleDeleteHall(h.id)} className="text-red-400 bg-red-900/30 px-3 py-1 rounded text-sm">Borrar</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* --- PESTAÑA FUNCIONES --- */}
        {activeTab === 'showtimes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
             <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
                <h3 className="text-xl font-bold mb-4 text-blue-400">Programar</h3>
                <form onSubmit={handleCreateShowtime} className="space-y-4">
                    <select className="w-full bg-gray-700 border-gray-600 rounded p-2" onChange={e => setNewShowtime({...newShowtime, movie_id: e.target.value})}>
                        <option value="">Seleccionar Película</option>
                        {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                    <select className="w-full bg-gray-700 border-gray-600 rounded p-2" onChange={e => setNewShowtime({...newShowtime, hall_id: e.target.value})}>
                        <option value="">Seleccionar Sala</option>
                        {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                    <input type="datetime-local" className="w-full bg-gray-700 border-gray-600 rounded p-2 text-white scheme-dark" onChange={e => setNewShowtime({...newShowtime, start_time: e.target.value})} />
                    <input type="number" className="w-full bg-gray-700 border-gray-600 rounded p-2" placeholder="Precio" value={newShowtime.price} onChange={e => setNewShowtime({...newShowtime, price: e.target.value})} />
                    <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold">Guardar</button>
                </form>
             </div>
             <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr><th className="p-4">Fecha</th><th className="p-4">Película</th><th className="p-4">Sala</th><th className="p-4">Acción</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {showtimes.map(st => (
                            <tr key={st.id} className="hover:bg-gray-700/50">
                                <td className="p-4 text-yellow-400 font-bold">{new Date(st.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                                <td className="p-4">{st.Movie?.title}</td>
                                <td className="p-4">{st.Hall?.name}</td>
                                <td className="p-4"><button onClick={() => handleDeleteShowtime(st.id)} className="text-red-400 bg-red-900/30 px-3 py-1 rounded text-sm">X</button></td>
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