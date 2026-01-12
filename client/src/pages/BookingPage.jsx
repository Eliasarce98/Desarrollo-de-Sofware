import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function BookingPage() {
  const { movieId } = useParams(); // Recibimos el ID de la película
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1); // 1: Función, 2: Asientos, 3: Pago
  
  // Datos
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  
  // Selección de Usuario
  const [selectedSeats, setSelectedSeats] = useState([]); // [{row, col}]
  const [ticketTypes, setTicketTypes] = useState({ adult: 0, child: 0, senior: 0 }); // Cantidades

  // Carga Inicial
  useEffect(() => {
    // 1. Cargar info de la peli
    fetch('http://localhost:3000/api/movies')
      .then(res => res.json())
      .then(data => setMovie(data.find(m => m.id == movieId)));

    // 2. Cargar funciones disponibles para esta peli
    fetch(`http://localhost:3000/api/movies/${movieId}/showtimes`)
      .then(res => res.json())
      .then(data => setShowtimes(data));
  }, [movieId]);

  // Cuando elige función, cargamos los asientos ocupados
  useEffect(() => {
    if (selectedShowtime) {
      fetch(`http://localhost:3000/api/showtimes/${selectedShowtime.id}/seats`)
        .then(res => res.json())
        .then(data => setOccupiedSeats(data));
      setSelectedSeats([]); // Limpiar selección anterior
      setTicketTypes({ adult: 0, child: 0, senior: 0 });
    }
  }, [selectedShowtime]);

  // --- LÓGICA DE PRECIOS ---
  const getPrice = () => {
    if (!selectedShowtime) return 0;
    const base = selectedShowtime.price;
    const date = new Date(selectedShowtime.start_time);
    const day = date.getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mie...
    
    // Descuento por Día (Martes y Miércoles al 50%)
    let dayDiscount = 1;
    let promoText = "";
    if (day === 2 || day === 3) {
        dayDiscount = 0.5;
        promoText = "¡Promo Mitad de Precio!";
    }

    // Precios unitarios finales
    const pAdult = base * dayDiscount;
    const pChild = base * 0.9 * dayDiscount; // Menor 10% off + día
    const pSenior = base * 0.8 * dayDiscount; // Jubilado 20% off + día

    const total = (ticketTypes.adult * pAdult) + 
                  (ticketTypes.child * pChild) + 
                  (ticketTypes.senior * pSenior);
    
    return { total, pAdult, pChild, pSenior, promoText };
  };

  // --- MANEJO DE ASIENTOS ---
  const toggleSeat = (r, c) => {
    const isSelected = selectedSeats.find(s => s.row === r && s.col === c);
    if (isSelected) {
        setSelectedSeats(selectedSeats.filter(s => s.row !== r || s.col !== c));
    } else {
        setSelectedSeats([...selectedSeats, { row: r, col: c }]);
    }
  };

  const isOccupied = (r, c) => occupiedSeats.some(s => s.row === r && s.col === c);

  // --- CONFIRMAR COMPRA ---
  const handleBuy = async () => {
    const userStored = localStorage.getItem('usuario_cine');
    if (!userStored) {
        alert("Inicia sesión para comprar");
        navigate('/login');
        return;
    }
    const user = JSON.parse(userStored);
    
    // Validación: Cantidad de tickets debe coincidir con asientos
    const totalTickets = ticketTypes.adult + ticketTypes.child + ticketTypes.senior;
    if (totalTickets !== selectedSeats.length) {
        alert(`Seleccionaste ${selectedSeats.length} asientos pero indicaste ${totalTickets} personas. Deben coincidir.`);
        return;
    }

    const { total } = getPrice();

    const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            user_id: user.id,
            showtime_id: selectedShowtime.id,
            seats: selectedSeats,
            total: total
        })
    });

    if (response.ok) {
        alert("¡Compra Exitosa! Disfruta la función 🍿");
        navigate('/');
    } else {
        alert("Error al procesar pago.");
    }
  };

  if (!movie) return <div className="text-white p-10">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 border-b border-gray-700 pb-4">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">← Volver</button>
        <h1 className="text-3xl font-bold text-red-500">Comprar Entradas: <span className="text-white">{movie.title}</span></h1>
      </div>

      {/* PASO 1: SELECCIONAR FUNCIÓN */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-yellow-500">1. Elige tu Función</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
            {showtimes.length === 0 && <p className="text-gray-500">No hay funciones disponibles.</p>}
            {showtimes.map(st => (
                <button
                    key={st.id}
                    onClick={() => { setSelectedShowtime(st); setPaso(2); }}
                    className={`p-4 rounded-lg border ${selectedShowtime?.id === st.id ? 'bg-red-600 border-red-500' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'} min-w-[150px] transition`}
                >
                    <div className="text-lg font-bold">{new Date(st.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                    <div className="text-sm text-gray-300">{new Date(st.start_time).toLocaleDateString()}</div>
                    <div className="text-xs mt-2 bg-black/30 p-1 rounded text-center">{st.Hall.name}</div>
                </button>
            ))}
        </div>
      </div>

      {/* PASO 2: SELECCIONAR ASIENTOS */}
      {selectedShowtime && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
            {/* LADO IZQ: MATRIZ */}
            <div>
                <h3 className="text-xl font-bold mb-4 text-yellow-500">2. Elige tus Asientos</h3>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg inline-block">
                    <div className="w-full bg-gray-600 h-2 mb-8 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div> {/* Pantalla */}
                    <p className="text-center text-xs text-gray-500 mb-4">PANTALLA</p>
                    
                    <div 
                        className="grid gap-2 justify-center"
                        style={{ gridTemplateColumns: `repeat(${selectedShowtime.Hall.cols}, minmax(30px, 1fr))` }}
                    >
                        {Array.from({ length: selectedShowtime.Hall.rows }).map((_, r) => (
                            Array.from({ length: selectedShowtime.Hall.cols }).map((_, c) => {
                                const row = r + 1;
                                const col = c + 1;
                                const occupied = isOccupied(row, col);
                                const selected = selectedSeats.find(s => s.row === row && s.col === col);
                                
                                return (
                                    <button
                                        key={`${row}-${col}`}
                                        disabled={occupied}
                                        onClick={() => toggleSeat(row, col)}
                                        className={`
                                            w-8 h-8 rounded text-xs font-bold transition
                                            ${occupied ? 'bg-gray-600 cursor-not-allowed opacity-50' : 
                                              selected ? 'bg-green-500 text-black scale-110 shadow-lg shadow-green-500/50' : 
                                              'bg-gray-700 hover:bg-gray-500'}
                                        `}
                                        title={`Fila ${row} Asiento ${col}`}
                                    >
                                        {occupied ? 'X' : ''}
                                    </button>
                                );
                            })
                        ))}
                    </div>
                    
                    <div className="flex justify-center gap-6 mt-6 text-sm">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-700 rounded"></div> Libre</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div> Elegido</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-600 opacity-50 rounded"></div> Ocupado</div>
                    </div>
                </div>
            </div>

            {/* LADO DER: TIPO DE ENTRADA Y PAGO */}
            <div>
                <h3 className="text-xl font-bold mb-4 text-yellow-500">3. Tipo de Entrada</h3>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    {getPrice().promoText && (
                        <div className="bg-purple-600 text-white text-center p-2 rounded mb-4 font-bold animate-pulse">
                            {getPrice().promoText}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span>Adulto (${getPrice().pAdult})</span>
                            <input 
                                type="number" min="0" 
                                value={ticketTypes.adult}
                                onChange={e => setTicketTypes({...ticketTypes, adult: parseInt(e.target.value) || 0})}
                                className="w-20 bg-gray-700 border border-gray-600 rounded p-2 text-center"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Menor (${getPrice().pChild}) <span className="text-xs text-green-400">-10%</span></span>
                            <input 
                                type="number" min="0" 
                                value={ticketTypes.child}
                                onChange={e => setTicketTypes({...ticketTypes, child: parseInt(e.target.value) || 0})}
                                className="w-20 bg-gray-700 border border-gray-600 rounded p-2 text-center"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Jubilado (${getPrice().pSenior}) <span className="text-xs text-green-400">-20%</span></span>
                            <input 
                                type="number" min="0" 
                                value={ticketTypes.senior}
                                onChange={e => setTicketTypes({...ticketTypes, senior: parseInt(e.target.value) || 0})}
                                className="w-20 bg-gray-700 border border-gray-600 rounded p-2 text-center"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-6 pt-4">
                        <div className="flex justify-between text-xl font-bold">
                            <span>TOTAL:</span>
                            <span className="text-green-400">${getPrice().total}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-right">
                            {selectedSeats.length} butacas seleccionadas
                        </p>
                    </div>

                    <button 
                        onClick={handleBuy}
                        disabled={selectedSeats.length === 0 || getPrice().total === 0}
                        className="w-full mt-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition shadow-lg"
                    >
                        CONFIRMAR COMPRA
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}