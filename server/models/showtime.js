const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Showtime = sequelize.define('Showtime', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    movie_id: { type: DataTypes.INTEGER, allowNull: false },
    hall_id: { type: DataTypes.INTEGER, allowNull: false },
    start_time: { type: DataTypes.DATE, allowNull: false }, // Fecha y Hora
    price: { type: DataTypes.INTEGER, allowNull: false } // Precio de la entrada
});

module.exports = Showtime;