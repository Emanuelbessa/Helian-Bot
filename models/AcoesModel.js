const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('acoes', {
      id_acao: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    rei: Sequelize.STRING,
    reino: Sequelize.STRING,
    nome_acao: Sequelize.STRING,
    apoio: Sequelize.STRING,
    tropas: Sequelize.INTEGER,
    arqueiros: Sequelize.INTEGER,
    origem: Sequelize.STRING,
    destino: Sequelize.STRING,
    reino_alvo: Sequelize.STRING,
    ouro: Sequelize.INTEGER,
    rodada: Sequelize.STRING,
    });
  }
