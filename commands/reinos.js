const Reinos  = require('../models/ReinoModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);

module.exports = {
	name: 'reinos',
	description: 'Mostra os todos os reinos',
	async execute(message, args) {
            
            const Reino = Reinos(sequelize, Sequelize)

            const ListaReinos = await Reino.findAll({ attributes: ['nome_reino'] });
            const ReinosString = ListaReinos.map(t => t.nome_reino).join(', ') || 'Sem nome';
            return message.channel.send(`Lista de reinos: ${ReinosString}`);            
    },
};