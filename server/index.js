
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./database/db');
const Movie = require('./models/movie');

const app = express();

app.use(cors());
app.use(express.json());

// --- Rutas ---
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.findAll();
        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener películas' });
    }
});

app.get('/api/seed', async (req, res) => {
    try {
        await Movie.bulkCreate([
            { title: "Oppenheimer", genre: "Drama / Historia", image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
            { title: "Barbie", genre: "Comedia / Fantasía", image: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg" },
            { title: "Avatar 2", genre: "Ciencia Ficción", image: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg" },
            { title: "Mario Bros", genre: "Animación", image: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg" },
        ]);
        res.send('¡Datos cargados en la Base de Datos!');
    } catch (error) {
        res.send('Error al cargar datos: ' + error.message);
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log('✅ Conexión a MySQL exitosa y Tablas Sincronizadas');
    } catch (error) {
        console.error('❌ Error fatal de conexión:', error);
    }
});