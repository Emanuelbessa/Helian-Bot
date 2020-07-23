const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('mapa', {
      id_mapa: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nome_mapa: Sequelize.STRING,
    x: Sequelize.INTEGER,
    y: Sequelize.INTEGER,
    }, {
      freezeTableName: true,
    });
  }
