require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./database/db');
const nodemailer = require('nodemailer'); 
const QRCode = require('qrcode');

// Modelos
const Movie = require('./models/movie');
const User = require('./models/user');
const Hall = require('./models/hall');
const Showtime = require('./models/showtime');
const Booking = require('./models/booking');
const BookingSeat = require('./models/bookingSeat');

// Relaciones
Movie.hasMany(Showtime, { foreignKey: 'movie_id' });
Showtime.belongsTo(Movie, { foreignKey: 'movie_id' });
Hall.hasMany(Showtime, { foreignKey: 'hall_id' });
Showtime.belongsTo(Hall, { foreignKey: 'hall_id' });
User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });
Showtime.hasMany(Booking, { foreignKey: 'showtime_id' });
Booking.belongsTo(Showtime, { foreignKey: 'showtime_id' });
Booking.hasMany(BookingSeat, { foreignKey: 'booking_id' });
BookingSeat.belongsTo(Booking, { foreignKey: 'booking_id' });

const app = express();
app.use(cors());
app.use(express.json());

// Config Email
let transporter;
const initEmail = async () => {
    try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        console.log("📧 Email listo (Ethereal)");
    } catch (err) { console.error("Error email:", err); }
};
initEmail();

// --- RUTAS PELÍCULAS ---
app.get('/api/movies', async (req, res) => res.json(await Movie.findAll()));
app.post('/api/movies', async (req, res) => res.json(await Movie.create(req.body)));
// NUEVO: EDITAR PELÍCULA
app.put('/api/movies/:id', async (req, res) => {
    await Movie.update(req.body, { where: { id: req.params.id } });
    res.json({ message: "Actualizado" });
});
app.delete('/api/movies/:id', async (req, res) => { await Movie.destroy({where:{id:req.params.id}}); res.json({msg:"ok"}); });

// --- RUTAS SALAS ---
app.get('/api/halls', async (req, res) => res.json(await Hall.findAll()));
app.post('/api/halls', async (req, res) => res.json(await Hall.create(req.body)));
// NUEVO: EDITAR SALA
app.put('/api/halls/:id', async (req, res) => {
    await Hall.update(req.body, { where: { id: req.params.id } });
    res.json({ message: "Actualizado" });
});
app.delete('/api/halls/:id', async (req, res) => { await Hall.destroy({where:{id:req.params.id}}); res.json({msg:"ok"}); });

// --- RUTAS FUNCIONES ---
app.get('/api/showtimes', async (req, res) => res.json(await Showtime.findAll({ include: [Movie, Hall], order: [['start_time', 'ASC']] })));
app.post('/api/showtimes', async (req, res) => res.json(await Showtime.create(req.body)));
// NUEVO: EDITAR FUNCIÓN
app.put('/api/showtimes/:id', async (req, res) => {
    await Showtime.update(req.body, { where: { id: req.params.id } });
    res.json({ message: "Actualizado" });
});
app.delete('/api/showtimes/:id', async (req, res) => { await Showtime.destroy({where:{id:req.params.id}}); res.json({msg:"ok"}); });

app.get('/api/movies/:id/showtimes', async (req, res) => {
    const showtimes = await Showtime.findAll({ where: { movie_id: req.params.id }, include: [Hall], order: [['start_time', 'ASC']] });
    res.json(showtimes);
});

app.get('/api/showtimes/:id/seats', async (req, res) => {
    const bookings = await Booking.findAll({ where: { showtime_id: req.params.id }, include: [BookingSeat] });
    let occupied = [];
    bookings.forEach(b => b.BookingSeats.forEach(s => occupied.push({ row: s.row, col: s.col })));
    res.json(occupied);
});

// --- AUTH & RESERVAS ---
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if(user && user.password === req.body.password) res.json({user}); else res.status(401).json({error:"Error"});
});
app.post('/api/register', async (req, res) => res.json(await User.create({...req.body, role:'client'})));
app.get('/api/bookings/user/:userId', async (req, res) => {
    const bookings = await Booking.findAll({ where: { user_id: req.params.userId }, include: [{ model: Showtime, include: [Movie, Hall] }, { model: BookingSeat }], order: [['createdAt', 'DESC']] });
    res.json(bookings);
});

app.post('/api/bookings', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { user_id, showtime_id, seats, total } = req.body;
        const newBooking = await Booking.create({ user_id, showtime_id, total_price: total }, { transaction: t });
        const seatsData = seats.map(s => ({ booking_id: newBooking.id, row: s.row, col: s.col }));
        await BookingSeat.bulkCreate(seatsData, { transaction: t });
        await t.commit();

        // Enviar Mail
        const user = await User.findByPk(user_id);
        const showtime = await Showtime.findByPk(showtime_id, { include: [Movie, Hall] });
        const qrData = `TICKET CINETIX\nReserva: #${newBooking.id}\nPelícula: ${showtime.Movie.title}\nSala: ${showtime.Hall.name}`;
        const qrImage = await QRCode.toDataURL(qrData);

        const info = await transporter.sendMail({
            from: '"Cinetix" <tickets@cinetix.com>',
            to: user.email,
            subject: `🎟️ Entradas: ${showtime.Movie.title}`,
            html: `<h1>¡Entradas Listas!</h1><p>Película: ${showtime.Movie.title}</p><p>Sala: ${showtime.Hall.name}</p><img src="${qrImage}" />`
        });
        console.log("📨 Email enviado. URL:", nodemailer.getTestMessageUrl(info));
        
        res.json({ message: "Compra exitosa", booking: newBooking });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: "Error compra" });
    }
});

app.get('/api/seed', async (req, res) => {
    try {
        await Movie.bulkCreate([
            { title: "Oppenheimer", genre: "Drama", image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
            { title: "Barbie", genre: "Comedia", image: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg" }
        ], { ignoreDuplicates: true });
        const adminExists = await User.findOne({ where: { email: "admin@cinetix.com" } });
        if (!adminExists) await User.create({ email: "admin@cinetix.com", password: "admin123", name: "Admin", role: "admin" });
        res.send('¡Seed OK!');
    } catch (error) { res.send('Error: ' + error.message); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`✅ Server corriendo en ${PORT}`);
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log('✅ BD Sincronizada');
    } catch (error) { 
        console.error('❌ Error conexión:', error); 
    }
});