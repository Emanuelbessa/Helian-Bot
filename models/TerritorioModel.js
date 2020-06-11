const Sequelize = require('sequelize');
 module.exports = (sequelize, type) => {
    return sequelize.define('territorios', {
      id_territorio: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    localizacao: Sequelize.STRING,
    nome_territorio: Sequelize.STRING,
    rei: Sequelize.STRING,
    ouro: Sequelize.INTEGER,
    tropas: Sequelize.INTEGER,
    });
  }
