const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Movie = sequelize.define('Movie', {
    // Definimos las columnas de la tabla
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    genre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(500), // Texto largo para URLs
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER, // En minutos
        defaultValue: 120
    },
    rating: {
        type: DataTypes.STRING,
        defaultValue: "ATP"
    }
});

module.exports = Movie;