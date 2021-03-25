const Territorios = require('../models/TerritorioModel.js');
const Reinos = require('../models/ReinoModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);

module.exports = {
    name: 'reino',
    description: 'Mostra todos os territórios do seu reino',
    async execute(message, args) {

        const Territorio = Territorios(sequelize, Sequelize);
        const Reino = Reinos(sequelize, Sequelize);

        let temterritorio = await Territorio.findAll({ where: { rei: `${message.author.username}` }, attributes: ['localizacao', 'rei', 'nome_territorio', 'tropas', 'arqueiros'], raw: true });
        let reino = await Reino.findOne({ where: { rei: `${message.author.username}` }, attributes: ['ouro', 'rei', 'nome_reino', 'ferro', 'madeira', 'trigo', 'tecido', 'oleo'], raw: true });

        if (temterritorio.length >= 1 && reino) {

            message.channel.send(`O seu reino **${reino.nome_reino}** possui **${reino.ouro}** de ouro e os seguintes territórios:\n`);

            for (var i = 0; i < temterritorio.length; i++) {

                message.channel.send(`Localização: **${temterritorio[i].localizacao}**; Soldados no território: **${temterritorio[i].tropas}**; Arqueiros no território: **${temterritorio[i].arqueiros}**\n`);
            }
            message.channel.send(`Seus recursos são:\n Ferro: ${reino.ferro}\n Madeira: ${reino.madeira}\n Tecido: ${reino.tecido}\n Óleo: ${reino.oleo}\n Trigo: ${reino.trigo}`)
        } else {
            return message.channel.send(`Você não possui um Reino ou territorios`);
        }


    },
};