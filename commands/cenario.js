const Territorios = require('../models/TerritorioModel.js');
const Reinos = require('../models/ReinoModel.js');
const Barcos = require('../models/BarcosModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const reino = require('./reino.js');
const sequelize = new Sequelize(config);

module.exports = {
    name: 'cenario',
    description: 'Comando que lhe informa tudo que é conhecido sobre os outros reinos',
    cooldown: 10,
    async execute(message, args) {

        const Territorio = Territorios(sequelize, Sequelize);
        const Reino = Reinos(sequelize, Sequelize);
        const Barco = Barcos(sequelize, Sequelize);

        let todosterritorios = await Territorio.findAll({ order: [['rei', 'DESC']], attributes: ['localizacao', 'rei', 'nome_territorio'], raw: true });
        let reinos = await Reino.findAll({ order: [['rei', 'DESC']], attributes: ['rei', 'nome_reino'], raw: true });
        let barcos = await Barco.findAll({ order: [['nome_rei', 'DESC']], attributes: ['nome_rei', 'nome_reino', 'nome_mar'], raw: true });

        message.channel.send(`Esses são os Reinos conhecidos:\n`);

        for (var i = 0; i < reinos.length; i++) {

            var nomes = ""
            var mares = ""

            var filtrados = todosterritorios.filter(function (a) {
                return a.rei == reinos[i].rei
            })

            var mares_filtrados = barcos.filter(function (a) {
                return a.nome_rei == reinos[i].rei
            })

            filtrados.forEach(function (p, i) {
                nomes = nomes + " " + "- " + p.localizacao
            })

            mares_filtrados.forEach(function (p, i) {
                mares = mares + " " + "- " + p.nome_mar
            })
            message.channel.send(`Reino: **${reinos[i].nome_reino}**; Territórios: **${nomes}**; Rei: **${reinos[i].rei}**; Mar(es): **${mares}**\n`);
        }
    },
};