const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Hall = sequelize.define('Hall', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false // Ej: "Sala A", "Sala VIP"
    },
    rows: {
        type: DataTypes.INTEGER,
        allowNull: false // Ej: 10 filas
    },
    cols: {
        type: DataTypes.INTEGER,
        allowNull: false // Ej: 8 asientos por fila
    }
});

module.exports = Hall;