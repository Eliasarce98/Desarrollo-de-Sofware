require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./database/db');

// Importar Modelos
const Movie = require('./models/movie');
const User = require('./models/user');
const Hall = require('./models/hall');
const Showtime = require('./models/showtime');
const Booking = require('./models/booking');         // NUEVO
const BookingSeat = require('./models/bookingSeat'); // NUEVO

// --- RELACIONES ---
Movie.hasMany(Showtime, { foreignKey: 'movie_id' });
Showtime.belongsTo(Movie, { foreignKey: 'movie_id' });

Hall.hasMany(Showtime, { foreignKey: 'hall_id' });
Showtime.belongsTo(Hall, { foreignKey: 'hall_id' });

// Relaciones de Reserva
User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

Showtime.hasMany(Booking, { foreignKey: 'showtime_id' });
Booking.belongsTo(Showtime, { foreignKey: 'showtime_id' });

Booking.hasMany(BookingSeat, { foreignKey: 'booking_id' });
BookingSeat.belongsTo(Booking, { foreignKey: 'booking_id' });

const app = express();
app.use(cors());
app.use(express.json());

// ... (Rutas de Movies, Halls, Users, Auth se mantienen IGUAL que antes) ...
// (Voy a resumir las anteriores para no hacer esto eterno, pero TÚ DÉJALAS COMO ESTABAN)
// Simplemente copia las rutas de bookings al final de tus rutas existentes.

// --- RUTAS EXISTENTES (Resumidas) ---
app.get('/api/movies', async (req, res) => res.json(await Movie.findAll()));
app.post('/api/movies', async (req, res) => res.json(await Movie.create(req.body)));
app.delete('/api/movies/:id', async (req, res) => { await Movie.destroy({where:{id:req.params.id}}); res.json({msg:"ok"}); });

app.get('/api/halls', async (req, res) => res.json(await Hall.findAll()));
app.post('/api/halls', async (req, res) => res.json(await Hall.create(req.body)));
app.delete('/api/halls/:id', async (req, res) => { await Hall.destroy({where:{id:req.params.id}}); res.json({msg:"ok"}); });

app.get('/api/showtimes', async (req, res) => res.json(await Showtime.findAll({include:[Movie, Hall]})));
app.post('/api/showtimes', async (req, res) => res.json(await Showtime.create(req.body)));
app.delete('/api/showtimes/:id', async (req, res) => { await Showtime.destroy({where:{id:req.params.id}}); res.json({msg:"ok"}); });

// Login/Register/Seed... (Déjalas igual)
app.post('/api/register', async (req, res) => res.json(await User.create({...req.body, role:'client'})));
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if(user && user.password === req.body.password) res.json({user});
    else res.status(401).json({error:"Error"});
});
app.get('/api/seed', async (req, res) => { /* Tu código seed */ res.send("Seed OK"); });


// ==========================================
// RUTAS NUEVAS: RESERVAS Y ASIENTOS
// ==========================================

// 1. Obtener funciones de una película específica
app.get('/api/movies/:id/showtimes', async (req, res) => {
    try {
        const showtimes = await Showtime.findAll({
            where: { movie_id: req.params.id },
            include: [Hall],
            order: [['start_time', 'ASC']]
        });
        res.json(showtimes);
    } catch (error) { res.status(500).json({error: error.message}); }
});

// 2. Obtener asientos ocupados de una función
app.get('/api/showtimes/:id/seats', async (req, res) => {
    try {
        // Buscamos todas las reservas de esta función
        const bookings = await Booking.findAll({
            where: { showtime_id: req.params.id },
            include: [BookingSeat] // Traemos los asientos de cada reserva
        });
        
        // Aplanamos el array para devolver solo una lista de {row, col}
        let occupiedSeats = [];
        bookings.forEach(b => {
            b.BookingSeats.forEach(s => occupiedSeats.push({ row: s.row, col: s.col }));
        });
        
        res.json(occupiedSeats);
    } catch (error) { res.status(500).json({error: error.message}); }
});

// 3. Crear una Reserva (Compra)
app.post('/api/bookings', async (req, res) => {
    const t = await sequelize.transaction(); // Usamos transacción por seguridad
    try {
        const { user_id, showtime_id, seats, total } = req.body;
        // seats es un array: [{row:1, col:2}, {row:1, col:3}]

        // A. Crear la Reserva
        const newBooking = await Booking.create({
            user_id, showtime_id, total_price: total
        }, { transaction: t });

        // B. Crear los asientos ocupados vinculados a esa reserva
        const seatsData = seats.map(s => ({
            booking_id: newBooking.id,
            row: s.row,
            col: s.col
        }));
        
        await BookingSeat.bulkCreate(seatsData, { transaction: t });

        await t.commit(); // Confirmar cambios
        res.json({ message: "¡Compra exitosa!", booking: newBooking });

    } catch (error) {
        await t.rollback(); // Si falla algo, deshacer todo
        res.status(500).json({ error: "Error al procesar la compra: " + error.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Crea tablas Booking y BookingSeat
    console.log('✅ BD Sincronizada');
});