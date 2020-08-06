const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('exercitos', {
      id_exercito: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    reino: Sequelize.STRING,
    localizacao: Sequelize.STRING,
    tipo_tropa: Sequelize.STRING,
    quantidade: Sequelize.INTEGER,
    });
  }
