const Acoes = require('../models/AcoesModel.js');
const AcoesBarco = require('../models/AcoesBarcoModel.js');
const Reinos = require('../models/ReinoModel.js');
const Rodada = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'acao',
    description: 'Comando para gerenciar suas ações na rodada, digite !acao ver para verificar suas ações feitas até o momento e !acao apagar para apagar todas',
    async execute(message, args) {
        const { commands } = message.client;
        if (args.length > 1) {
            return message.channel.send(`Comando de ação usado de forma incorreta`);
        } else if (args[0] == 'apagar') {

            const Acao = Acoes(sequelize, Sequelize);
            const AcaoBarco = AcoesBarco(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);
            const RodadaAtual = Rodada(sequelize, Sequelize);

            let rodadaatual = await RodadaAtual.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let rodadacerta = parseInt(rodadaatual[0].rodada_atual);
            let deletar = await Acao.destroy({ where: { rei: `${message.author.username}`, rodada: `${rodadacerta}` } })
            let deletarBarcos = await AcaoBarco.destroy({ where: { rei: `${message.author.username}`, rodada: `${rodadacerta}` } })
            let temreino = await Reino.findOne({ where: { rei: `${message.author.username}` } });

            if (deletarBarcos) {
                Reino.update({
                    barcos_ocupados: 0,
                }, {
                    where: { nome_reino: temreino.nome_reino }
                });
            }
            if (deletar || deletarBarcos) {
                return message.channel.send(`Todas as suas ações da rodada atual foram deletadas`);
            }


        } else if (args[0] == 'ver') {

            const Acao = Acoes(sequelize, Sequelize);
            const AcaoBarco = AcoesBarco(sequelize, Sequelize);
            const RodadaAtual = Rodada(sequelize, Sequelize);

            let rodadaatual = await RodadaAtual.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let rodadacerta = parseInt(rodadaatual[0].rodada_atual);
            let ver = await Acao.findAll({ where: { rei: `${message.author.username}`, rodada: `${rodadacerta}` } })
            let verbarcos = await AcaoBarco.findAll({ where: { rei: `${message.author.username}`, rodada: `${rodadacerta}` } })

            if (ver) {
                message.channel.send(`Suas ações da rodada atual são:\n`);

                for (var i = 0; i < ver.length; i++) {
                    message.channel.send(`Ação: **${ver[i].nome_acao}**; Tropas: **${ver[i].tropas}**; Arqueiros: **${ver[i].arqueiros}**; Origem: **${ver[i].origem}**; Destino: **${ver[i].destino}**\n`);
                }
            }
            if (verbarcos) {
                message.channel.send(`Suas ações da rodada atual utilizando barcos são:\n`);

                for (var i = 0; i < verbarcos.length; i++) {
                    message.channel.send(`Ação: **${verbarcos[i].nome_acao}**; Tropas: **${verbarcos[i].tropas}**; Arqueiros: **${verbarcos[i].arqueiros}**; Origem: **${verbarcos[i].origem}**; Destino: **${verbarcos[i].destino}**\n`);
                }
            }
            message.channel.send(`Para apagar suas ações nesta rodada, digite !acao apagar`);
        } else {
            return message.channel.send(`Comando de ação usado de forma incorreta`);
        }
    }
};