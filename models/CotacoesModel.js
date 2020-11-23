const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('cotacoes', {
      id_cotacao: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    reino: Sequelize.STRING,
    rei: Sequelize.STRING,
    ferro: Sequelize.INTEGER,
    madeira: Sequelize.INTEGER,
    tecido: Sequelize.INTEGER,
    oleo: Sequelize.INTEGER,
    trigo: Sequelize.INTEGER,
    rodada: Sequelize.INTEGER,
    }, {
      freezeTableName: true,
    });
  }
