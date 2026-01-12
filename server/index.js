require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./database/db');

// Importar Modelos
const Movie = require('./models/movie');
const User = require('./models/user');
const Hall = require('./models/hall');
const Showtime = require('./models/showtime');

// --- DEFINIR RELACIONES ---
Movie.hasMany(Showtime, { foreignKey: 'movie_id' });
Showtime.belongsTo(Movie, { foreignKey: 'movie_id' });

Hall.hasMany(Showtime, { foreignKey: 'hall_id' });
Showtime.belongsTo(Hall, { foreignKey: 'hall_id' });

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// RUTAS DE PELÍCULAS
// ==========================================
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.findAll();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener películas' });
    }
});

// Crear Película (NUEVO - Lo que te faltaba para el panel)
app.post('/api/movies', async (req, res) => {
    try {
        const movie = await Movie.create(req.body);
        res.json(movie);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Borrar Película (NUEVO)
app.delete('/api/movies/:id', async (req, res) => {
    try {
        await Movie.destroy({ where: { id: req.params.id } });
        res.json({ message: "Película eliminada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// RUTAS DE SALAS (HALLS)
// ==========================================
app.get('/api/halls', async (req, res) => {
    const halls = await Hall.findAll();
    res.json(halls);
});

app.post('/api/halls', async (req, res) => {
    try {
        const hall = await Hall.create(req.body);
        res.json(hall);
    } catch(e) { res.status(400).json({error: e.message}) }
});

app.delete('/api/halls/:id', async (req, res) => {
    await Hall.destroy({ where: { id: req.params.id } });
    res.json({ message: "Eliminado" });
});

// ==========================================
// RUTAS DE FUNCIONES (SHOWTIMES)
// ==========================================
app.get('/api/showtimes', async (req, res) => {
    try {
        const showtimes = await Showtime.findAll({
            include: [Movie, Hall],
            order: [['start_time', 'ASC']]
        });
        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/showtimes', async (req, res) => {
    try {
        const { movie_id, hall_id, start_time, price } = req.body;
        const newShowtime = await Showtime.create({ movie_id, hall_id, start_time, price });
        res.json(newShowtime);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/showtimes/:id', async (req, res) => {
    try {
        await Showtime.destroy({ where: { id: req.params.id } });
        res.json({ message: "Función eliminada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// AUTENTICACIÓN Y SEED
// ==========================================

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        if (user.password !== password) return res.status(401).json({ error: "Contraseña incorrecta" });

        res.json({ message: "Login exitoso", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Registro
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const newUser = await User.create({ email, password, name, role: 'client' });
        res.json({ message: "Usuario creado!", user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Seed (Datos de prueba + Admin)
app.get('/api/seed', async (req, res) => {
    try {
        // 1. Películas Base
        await Movie.bulkCreate([
            { title: "Oppenheimer", genre: "Drama / Historia", image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
            { title: "Barbie", genre: "Comedia / Fantasía", image: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg" },
            { title: "Avatar 2", genre: "Ciencia Ficción", image: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg" },
            { title: "Mario Bros", genre: "Animación", image: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg" },
        ], { ignoreDuplicates: true });

        // 2. Admin Cinetix
        const adminEmail = "admin@cinetix.com";
        const adminExists = await User.findOne({ where: { email: adminEmail } });

        if (!adminExists) {
            await User.create({
                email: adminEmail,
                password: "admin123",
                name: "Admin Cinetix",
                role: "admin"
            });
            res.send('¡Datos cargados! Admin creado: admin@cinetix.com / admin123');
        } else {
            res.send('¡Datos cargados! (Admin ya existe)');
        }
    } catch (error) {
        res.send('Error: ' + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log('✅ Base de Datos Sincronizada');
    } catch (error) {
        console.error('❌ Error conexión:', error);
    }
});