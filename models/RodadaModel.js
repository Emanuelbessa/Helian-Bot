const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('rodada', {
      id_rodada: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    rodada_atual: Sequelize.INTEGER,
    }, {
      freezeTableName: true,
    });
  }
