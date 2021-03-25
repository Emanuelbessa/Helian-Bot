const Cotacoes = require('../models/CotacoesModel.js');
const Reinos = require('../models/ReinoModel.js');
const Rodada = require('../models/RodadaModel.js');
const AcoesTrasnf = require('../models/AcoesTransferirModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'vender',
    description: 'Foca o território em produzir riquezas. Na próxima rodada irá conceder ouro a quem for o dono deste território. Quanto mais territórios possuir, menos ouro dará. Para usar digite !coletar território',
    async execute(message, args) {
        if (args.length != 2) {
            return message.channel.send('Comando utilizado de forma incorreta, digite !coletar território.');
        } else {

            const quantidade = args[0].toLowerCase();
            const recurso = args[1].toLowerCase();

            const Reino = Reinos(sequelize, Sequelize);
            const Cotacao = Cotacoes(sequelize, Sequelize);
            const RodadaAtual = Rodada(sequelize, Sequelize);
            const AcaoTransf = AcoesTrasnf(sequelize, Sequelize);

            let rodadaatual = await RodadaAtual.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let reino = await Reino.findOne({ where: { rei: `${message.author.username}` }, attributes: ['rei', 'ferro', 'madeira', 'oleo', 'tecido', 'trigo', 'ouro'], raw: true });
            let cotacoes = await Cotacao.findOne({ where: { rei: `${message.author.username}`, rodada: rodadaatual[0].rodada_atual }, attributes: ['rei', 'ferro', 'madeira', 'oleo', 'tecido', 'trigo'], raw: true });
            let acoestransf = await AcaoTransf.findOne({ where: { rei: `${message.author.username}`, rodada: rodadaatual[0].rodada_atual }, attributes: ['rei', 'ferro', 'madeira', 'oleo', 'tecido', 'trigo'], raw: true });

            if (reino[recurso] < quantidade) {
                return message.channel.send(`Você não possui essa quantidade do recurso`);
            }

            if (acoestransf) {
                return message.channel.send(`Você possui ações de transferencia em aberto, refaça suas ações para vender seus recursos`);
            }

            var ganho = quantidade * cotacoes[recurso]

            Reino.increment('ouro', { by: ganho, where: { rei: message.author.username } });
            Reino.decrement(recurso, { by: quantidade, where: { rei: message.author.username } });

            return message.channel.send(`Você conseguiu realizar a venda com sucesso!`);

        }
    }
};