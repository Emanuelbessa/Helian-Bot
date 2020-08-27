const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('acoes_barcos', {
      id_acao: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nome_acao: Sequelize.STRING,
    apoio: Sequelize.STRING,
    tropas: Sequelize.INTEGER,
    arqueiros: Sequelize.INTEGER,
    rei: Sequelize.STRING,
    origem: Sequelize.STRING,
    destino: Sequelize.STRING,
    rodada: Sequelize.STRING,
    });
  }
