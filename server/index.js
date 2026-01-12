require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./database/db');
const Movie = require('./models/movie');
const User = require('./models/user');

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

// --- RUTA MÁGICA (SEED) ---
// Crea películas y al Admin
app.get('/api/seed', async (req, res) => {
    try {
        // 1. Crear Películas
        await Movie.bulkCreate([
            { title: "Oppenheimer", genre: "Drama / Historia", image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
            { title: "Barbie", genre: "Comedia / Fantasía", image: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg" },
            { title: "Avatar 2", genre: "Ciencia Ficción", image: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg" },
            { title: "Mario Bros", genre: "Animación", image: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg" },
        ], { ignoreDuplicates: true });

        // 2. Crear Usuario Admin (Si no existe)
        const adminEmail = "admin@cinetix.com"; // Usamos el dominio nuevo
        const adminExists = await User.findOne({ where: { email: adminEmail } });

        if (!adminExists) {
            await User.create({
                email: adminEmail,
                password: "admin123", // Contraseña del admin
                name: "Admin Cinetix",
                role: "admin" // <--- ROL IMPORTANTE
            });
            res.send('¡Datos cargados! Admin creado: admin@cinetix.com / admin123');
        } else {
            res.send('¡Datos cargados! (El admin ya existía)');
        }

    } catch (error) {
        res.send('Error: ' + error.message);
    }
});

// --- Rutas de Usuarios ---
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Por defecto se crean como 'client'
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
        await sequelize.sync({ alter: true });
        console.log('✅ Base de Datos Sincronizada');
    } catch (error) {
        console.error('❌ Error conexión:', error);
    }
});