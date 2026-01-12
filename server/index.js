require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./database/db');
const nodemailer = require('nodemailer'); // Para enviar emails
const QRCode = require('qrcode');         // Para generar el QR

// Importar Modelos
const Movie = require('./models/movie');
const User = require('./models/user');
const Hall = require('./models/hall');
const Showtime = require('./models/showtime');
const Booking = require('./models/booking');
const BookingSeat = require('./models/bookingSeat');

// --- DEFINIR RELACIONES (Associations) ---
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

// --- CONFIGURACIÓN DE EMAIL (Ethereal - Modo Prueba) ---
let transporter;
const initEmail = async () => {
    try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("📧 Sistema de correos listo (Modo Prueba Ethereal)");
    } catch (err) {
        console.error("Error iniciando email:", err);
    }
};
initEmail();

// ==========================================
// RUTAS DE PELÍCULAS
// ==========================================
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.findAll();
        res.json(movies);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/movies', async (req, res) => {
    try {
        const movie = await Movie.create(req.body);
        res.json(movie);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete('/api/movies/:id', async (req, res) => {
    try {
        await Movie.destroy({ where: { id: req.params.id } });
        res.json({ message: "Película eliminada" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// RUTAS DE SALAS (HALLS)
// ==========================================
app.get('/api/halls', async (req, res) => res.json(await Hall.findAll()));
app.post('/api/halls', async (req, res) => res.json(await Hall.create(req.body)));
app.delete('/api/halls/:id', async (req, res) => { await Hall.destroy({where:{id:req.params.id}}); res.json({msg:"ok"}); });

// ==========================================
// RUTAS DE FUNCIONES (SHOWTIMES)
// ==========================================
app.get('/api/showtimes', async (req, res) => {
    const showtimes = await Showtime.findAll({ include: [Movie, Hall], order: [['start_time', 'ASC']] });
    res.json(showtimes);
});
app.post('/api/showtimes', async (req, res) => res.json(await Showtime.create(req.body)));
app.delete('/api/showtimes/:id', async (req, res) => { await Showtime.destroy({where:{id:req.params.id}}); res.json({msg:"ok"}); });

// Obtener funciones de una película específica
app.get('/api/movies/:id/showtimes', async (req, res) => {
    const showtimes = await Showtime.findAll({ where: { movie_id: req.params.id }, include: [Hall], order: [['start_time', 'ASC']] });
    res.json(showtimes);
});

// Obtener asientos ocupados
app.get('/api/showtimes/:id/seats', async (req, res) => {
    const bookings = await Booking.findAll({ where: { showtime_id: req.params.id }, include: [BookingSeat] });
    let occupied = [];
    bookings.forEach(b => b.BookingSeats.forEach(s => occupied.push({ row: s.row, col: s.col })));
    res.json(occupied);
});

// ==========================================
// AUTENTICACIÓN
// ==========================================
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if(user && user.password === req.body.password) res.json({user});
    else res.status(401).json({error:"Error"});
});

app.post('/api/register', async (req, res) => res.json(await User.create({...req.body, role:'client'})));

// Obtener reservas de un usuario
app.get('/api/bookings/user/:userId', async (req, res) => {
    const bookings = await Booking.findAll({ where: { user_id: req.params.userId }, include: [{ model: Showtime, include: [Movie, Hall] }, { model: BookingSeat }], order: [['createdAt', 'DESC']] });
    res.json(bookings);
});

// =========================================================
// RUTA DE COMPRA (CON EMAIL Y QR)
// =========================================================
app.post('/api/bookings', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { user_id, showtime_id, seats, total } = req.body;

        // 1. Guardar Reserva
        const newBooking = await Booking.create({ user_id, showtime_id, total_price: total }, { transaction: t });
        
        // 2. Guardar Asientos
        const seatsData = seats.map(s => ({ booking_id: newBooking.id, row: s.row, col: s.col }));
        await BookingSeat.bulkCreate(seatsData, { transaction: t });

        await t.commit(); // Confirmar en BD

        // --- ENVIAR MAIL CON QR ---
        // A. Obtener datos completos
        const user = await User.findByPk(user_id);
        const showtime = await Showtime.findByPk(showtime_id, { include: [Movie, Hall] });
        
        // B. Generar QR
        const qrData = `TICKET CINETIX\nReserva: #${newBooking.id}\nPelícula: ${showtime.Movie.title}\nSala: ${showtime.Hall.name}\nAsientos: ${seats.length}`;
        const qrImage = await QRCode.toDataURL(qrData);

        // C. Enviar Email
        const info = await transporter.sendMail({
            from: '"Cinetix Entradas" <tickets@cinetix.com>',
            to: user.email, 
            subject: `🎟️ Tus entradas para ${showtime.Movie.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
                    <h1 style="color: #e50914;">¡Gracias por tu compra en Cinetix!</h1>
                    <p>Hola <b>${user.name}</b>, aquí tienes tus entradas.</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h2 style="margin-top:0;">${showtime.Movie.title}</h2>
                        <p><strong>Sala:</strong> ${showtime.Hall.name}</p>
                        <p><strong>Horario:</strong> ${new Date(showtime.start_time).toLocaleString()}</p>
                        <p><strong>Total:</strong> $${total}</p>
                    </div>
                    <div style="text-align: center;">
                        <p>Presenta este código QR en la entrada:</p>
                        <img src="${qrImage}" alt="Código QR" style="width: 200px;" />
                    </div>
                </div>
            `
        });

        console.log("📨 Email enviado. URL PREVISUALIZACIÓN:", nodemailer.getTestMessageUrl(info));
        res.json({ message: "¡Compra exitosa! Revisa tu correo.", booking: newBooking });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: "Error al procesar la compra" });
    }
});

// Seed
app.get('/api/seed', async (req, res) => {
    try {
        await Movie.bulkCreate([
            { title: "Oppenheimer", genre: "Drama / Historia", image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
            { title: "Barbie", genre: "Comedia / Fantasía", image: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg" },
            { title: "Avatar 2", genre: "Ciencia Ficción", image: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg" },
            { title: "Mario Bros", genre: "Animación", image: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg" },
        ], { ignoreDuplicates: true });

        const adminEmail = "admin@cinetix.com";
        const adminExists = await User.findOne({ where: { email: adminEmail } });
        if (!adminExists) {
            await User.create({ email: adminEmail, password: "admin123", name: "Admin Cinetix", role: "admin" });
            res.send('¡Datos cargados! Admin creado.');
        } else {
            res.send('¡Datos cargados!');
        }
    } catch (error) { res.send('Error: ' + error.message); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log('✅ Base de Datos Sincronizada');
    } catch (error) { console.error('❌ Error conexión:', error); }
});