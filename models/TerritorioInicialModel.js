const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('territorio_inicial', {
    territorio_inicial_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    localizacao: Sequelize.STRING,
    ocupado: Sequelize.INTEGER,
    }, {
      freezeTableName: true,
    });
  }
