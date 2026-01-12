require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./database/db');
const Movie = require('./models/movie');
const User = require('./models/user');
const Hall = require('./models/hall'); // <--- 1. Importamos el modelo Sala

const app = express();
app.use(cors());
app.use(express.json());

// --- Rutas de Películas ---
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.findAll();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener películas' });
    }
});

// --- RUTAS DE SALAS (NUEVO) ---
// 1. Obtener todas las salas
app.get('/api/halls', async (req, res) => {
    try {
        const halls = await Hall.findAll();
        res.json(halls);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener salas' });
    }
});

// 2. Crear una sala nueva
app.post('/api/halls', async (req, res) => {
    try {
        const { name, rows, cols } = req.body;
        const newHall = await Hall.create({ name, rows, cols });
        res.json({ message: "Sala creada!", hall: newHall });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 3. Borrar una sala
app.delete('/api/halls/:id', async (req, res) => {
    try {
        await Hall.destroy({ where: { id: req.params.id } });
        res.json({ message: "Sala eliminada" });
    } catch (error) {
        res.status(500).json({ error: "No se pudo eliminar" });
    }
});


// --- Rutas de Usuarios / Auth ---
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
            await User.create({
                email: adminEmail,
                password: "admin123",
                name: "Admin Cinetix",
                role: "admin"
            });
            res.send('¡Datos cargados! Admin creado.');
        } else {
            res.send('¡Datos cargados! (El admin ya existía)');
        }
    } catch (error) {
        res.send('Error: ' + error.message);
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const newUser = await User.create({ email, password, name, role: 'client' });
        res.json({ message: "Usuario creado!", user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true }); // Esto creará la tabla Halls
        console.log('✅ Base de Datos Sincronizada');
    } catch (error) {
        console.error('❌ Error conexión:', error);
    }
});