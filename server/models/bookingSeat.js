const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const BookingSeat = sequelize.define('BookingSeat', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    booking_id: { type: DataTypes.INTEGER, allowNull: false },
    row: { type: DataTypes.INTEGER, allowNull: false },
    col: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = BookingSeat;