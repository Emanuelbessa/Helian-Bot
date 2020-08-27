const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('barcos', {
      id_barco: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nome_rei: Sequelize.STRING,
    nome_reino: Sequelize.STRING,
    nome_mar: Sequelize.STRING,
    });
  }
