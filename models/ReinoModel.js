const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('reinos', {
      id_reino: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nome_reino: Sequelize.STRING,
    inicial_conquistado: Sequelize.INTEGER,
    rei: Sequelize.STRING,
    ouro: Sequelize.INTEGER,
    ferro: Sequelize.INTEGER,
    madeira: Sequelize.INTEGER,
    tecido: Sequelize.INTEGER,
    oleo: Sequelize.INTEGER,
    trigo: Sequelize.INTEGER,
    custo_barco: Sequelize.INTEGER,
    barcos_ocupados: Sequelize.INTEGER,
    });
  }
