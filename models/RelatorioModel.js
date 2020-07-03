const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('relatorio', {
      id_relatorio: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    rei: Sequelize.STRING,
    origem: Sequelize.STRING,
    destino: Sequelize.STRING,
    mensagem: Sequelize.TEXT,
    rodada: Sequelize.INTEGER,
    }, {
      freezeTableName: true,
    });
  }
