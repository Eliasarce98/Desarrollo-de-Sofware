const { Sequelize } = require('sequelize'); 
require('dotenv').config({ path: '../.env' });

console.log("Intentando conectar con:");
console.log("Usuario:", process.env.DB_USER || "NO LEIDO");
console.log("Base de Datos:", process.env.DB_NAME || "NO LEIDO");
console.log("Pass:", process.env.DB_PASS ? "****" : "NO LEIDO");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

module.exports = sequelize;