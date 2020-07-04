const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('acoes', {
      id_acao: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nome_acao: Sequelize.STRING,
    tropas: Sequelize.INTEGER,
    rei: Sequelize.STRING,
    origem: Sequelize.STRING,
    destino: Sequelize.STRING,
    rodada: Sequelize.STRING,
    });
  }
