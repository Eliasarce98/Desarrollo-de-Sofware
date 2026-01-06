const express = require('express'); const cors = require('cors'); const dotenv = require('dotenv'); const sequelize = require('./database/db');

dotenv.config();

const app = express();

app.use(cors()); app.use(express.json());

app.get('/', (req, res) => { res.send('¡API del Cine funcionando! 🎬'); });

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => { console.log('Servidor corriendo en el puerto ${PORT}');

})