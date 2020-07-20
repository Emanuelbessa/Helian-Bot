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
    });
  }
