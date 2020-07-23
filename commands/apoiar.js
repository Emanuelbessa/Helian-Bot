const adj = require('./funcoes.js');
const Acoes = require('../models/AcoesModel.js');
const Mapas = require('../models/MapaModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Rodadas = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'apoiar',
    description: 'Para apoiar corretamente digite:\n!atacar origem destino',
    async execute(message, args) {
        const { commands } = message.client;
        if (args.length != 3) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara apoiar corretamente digite:\n!atacar origem destino`);
        } else if (args[0] == 'ataque' || args[0] == 'defesa') {

            const intencao = args[1].toLowerCase();
            const origem = args[0].toLowerCase();
            const destino = args[2].toLowerCase();

            const Mapa = Mapas(sequelize, Sequelize);
            const Acao = Acoes(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);

            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${origem}` } });
            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            console.log(rodadaatual[0].rodada_atual)
            let acao = await Acao.findOne({ where: { rei: `${message.author.username}`, origem: `${origem}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let orig = await Mapa.findOne({ where: { nome_mapa: `${origem}` } });
            let dest = await Mapa.findOne({ where: { nome_mapa: `${destino}` } });


            if (acao) {
                return message.channel.send(`Já existe uma ação registrada para esse territorio, espere a rodada acabar ou apague suas ações`);
            }

            if (dono) {

                if (!adj.adjacente(orig.x, orig.y, dest.x, dest.y)) {
                    return message.channel.send(`Seu território não está adjacente ao território de destino, reveja sua ação`);
                }

                Acao.create({
                    nome_acao: "apoiar",
                    apoio: `${intencao}`,
                    tropas: `${dono.dataValues.tropas}`,
                    origem: `${origem}`,
                    destino: `${destino}`,
                    rei: `${message.author.username}`,
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                return message.channel.send(`Ação de apoiar registrada`);

            } else {

                return message.channel.send(`Você não possui recursos suficiente ou o territorio não é seu`);
            }
        } else {
            return message.channel.send(`Comando utilizado de forma incorreta`);
        }
    },
};