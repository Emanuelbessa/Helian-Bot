const func = require('./funcoes.js');
const Acoes = require('../models/AcoesModel.js');
const AcoesBarco = require('../models/AcoesBarcoModel.js');
const Reinos = require('../models/ReinoModel.js');
const Barcos = require('../models/BarcosModel.js');
const Mapas = require('../models/MapaModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Rodadas = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'apoiar',
    description: 'Para apoiar corretamente digite:!apoiar origem ataque/defesa destino. Não há limite para quantidade de apoios em um território',
    async execute(message, args) {
        const { commands } = message.client;
        if (args.length != 3) {
            console.log(args.length);
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}! Digite:!apoiar origem ataque/defesa destino`);
        } else if (args[1] == 'ataque' || args[1] == 'defesa') {

            const intencao = args[1].toLowerCase();
            const origem = args[0].toLowerCase();
            const destino = args[2].toLowerCase();

            const Mapa = Mapas(sequelize, Sequelize);
            const Acao = Acoes(sequelize, Sequelize);
            const Barco = Barcos(sequelize, Sequelize);
            const AcaoBarco = AcoesBarco(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);

            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let reino = await Reino.findOne({ where: { rei: `${message.author.username}` } });
            let acao_barco = await AcaoBarco.findOne({ where: { rei: `${message.author.username}`, origem: `${origem}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let barcos = await Barco.findAll({ where: { nome_rei: `${message.author.username}` }, order: [['nome_rei', 'DESC']], attributes: ['nome_mar', 'nome_reino', 'nome_rei'], raw: true });
            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${origem}` } });
            let acao = await Acao.findOne({ where: { rei: `${message.author.username}`, origem: `${origem}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let orig = await Mapa.findOne({ where: { nome_mapa: `${origem}` } });
            let dest = await Mapa.findOne({ where: { nome_mapa: `${destino}` } });

            if (!dono) {
                return message.channel.send(`O territorio de origem não é seu`);
            }

            if (func.adjacente(orig.x, orig.y, dest.x, dest.y)) {

                if (acao) {
                    return message.channel.send(`Já existe uma ação registrada para esse territorio, espere a rodada acabar ou apague suas ações`);
                }

                if (dono.tropas == 0 && dono.arqueiros == 0) {
                    return message.channel.send(`Você não possui tropas suficientes para realizar um ataque`);
                }

                Acao.create({
                    nome_acao: "apoiar",
                    apoio: `${intencao}`,
                    tropas: `${dono.dataValues.tropas}`,
                    arqueiros: `${dono.dataValues.arqueiros}`,
                    origem: `${origem}`,
                    destino: `${destino}`,
                    rei: `${message.author.username}`,
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                return message.channel.send(`Ação de apoiar registrada`);
            }

            if (acao_barco) {
                return message.channel.send(`Já existe uma ação registrada para esse territorio, espere a rodada acabar`);
            }

            //O(s) Território(s) envolvidos não possuem adjacencia com um mar
            if (orig.nome_mar == null || dest.nome_mar == null) {
                return message.channel.send(`Os territórios não estão adjacentes.`);
            }

            //Teste para saber se existem barcos desocupados
            if (barcos.length <= reino.barcos_ocupados) {
                return message.channel.send(`Os territórios não estão adjacentes e você não possui barcos para auxiliar.`);
            }
            var mares_controle = []
            var mares_orig = orig.nome_mar.split(',')
            var mares_dest = dest.nome_mar.split(',')
            barcos.forEach(element => {
                mares_controle.push(element.nome_mar)
            });
            var adjacentes = {
                'norte': ['leste', 'oeste'],
                'sul': ['leste', 'oeste'],
                'leste': ['norte', 'sul'],
                'oeste': ['norte', 'sul'],
            }
            var retorno = false
            for (let a = 0; a < mares_orig.length; a++) {
                for (let b = 0; b < mares_dest.length; b++) {
                    var M_orig = mares_orig[a]
                    var M_dest = mares_dest[b]
                    retorno = func.mar_encontra_caminho(M_orig, M_dest, mares_controle, adjacentes)
                    if (retorno) {
                        break
                    }
                }
            }

            if (retorno) {
                reino.increment('barcos_ocupados')
                AcaoBarco.create({
                    nome_acao: "usar_barco_apoio",
                    apoio: `${intencao}`,
                    tropas: `${dono.dataValues.tropas}`,
                    arqueiros: `${dono.dataValues.arqueiros}`,
                    origem: `${origem}`,
                    destino: `${destino}`,
                    rei: `${message.author.username}`,
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                return message.channel.send(`Ação de apoiar registrada. Para ver suas ações nesta rodada, digite !acao ver`);
            } else {
                return message.channel.send(`Os territórios não estão adjacentes e você não possui barcos para auxiliar.`);
            }
        } else {
            return message.channel.send(`Comando utilizado de forma incorreta`);
        }
    },
};