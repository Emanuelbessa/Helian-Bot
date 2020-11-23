const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('acoes_transferencia', {
      id_acao: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    rei: Sequelize.STRING,
    reino: Sequelize.STRING,
    nome_acao: Sequelize.STRING,
    tropas: Sequelize.INTEGER,
    arqueiros: Sequelize.INTEGER,
    origem: Sequelize.STRING,
    destino: Sequelize.STRING,
    reino_alvo: Sequelize.STRING,
    madeira: Sequelize.INTEGER,
    trigo: Sequelize.INTEGER,
    oleo: Sequelize.INTEGER,
    tecido: Sequelize.INTEGER,
    ferro: Sequelize.INTEGER,
    ouro: Sequelize.INTEGER,
    rodada: Sequelize.STRING,
    });
  }
