const func = require('./funcoes.js');
const Acoes = require('../models/AcoesModel.js');
const Barcos = require('../models/BarcosModel.js');
const Mapas = require('../models/MapaModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Rodadas = require('../models/RodadaModel.js');
const Reinos = require('../models/ReinoModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'construir',
    description: 'Comando para construir barco, para usar digite !construir barco territorio mar. ',
    async execute(message, args) {
        const { commands } = message.client;
        if (args.length > 3) {
            console.log(args.length);
            return message.channel.send(`Você utilizou esse comando de forma incorreta------`);
        } else if (args[0] == 'barco') {

            const lugar = args[1].toLowerCase();
            const mar = args[2].toLowerCase();

            const Mapa = Mapas(sequelize, Sequelize);
            const Acao = Acoes(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);
            const Barco = Barcos(sequelize, Sequelize);

            let reino = await Reino.findOne({ where: { rei: `${message.author.username}` } });
            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${lugar}` } });
            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let acao = await Acao.findOne({ where: { rei: `${message.author.username}`, origem: `${lugar}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let orig = await Mapa.findOne({ where: { nome_mapa: `${lugar}` } });
            let barcos = await Barco.findAll({ where: { nome_rei: `${message.author.username}` }, order: [['nome_rei', 'DESC']], attributes: ['nome_mar', 'nome_reino', 'nome_rei'], raw: true });
            //let barco_construido = await Barco.findOne({ where: { nome_rei: `${message.author.username}`, nome_mar: `${mar}` }, order: [['nome_rei', 'DESC']], attributes: ['nome_mar', 'nome_reino', 'nome_rei'], raw: true });

            const embed = {
                "title": ":hammer: Ação de construir barco registrada :hammer:",
                "description": "Sua ação de construção de barco foi registrada com sucesso, essa ação demora 1 rodada para ser concluída. ```\nLembre-se que você ver as suas ações da rodada atual com o comando !acao ver, e apagar todas elas com !acao apagar```",
                "color": 65280,
                "timestamp": + new Date(),
                "footer": {
                    "text": "Ação registrada em"
                },
                "thumbnail": {
                    "url": "https://i.ytimg.com/vi/pKArytW4hBM/hqdefault.jpg"
                },
                "image": {
                    "url": "https://coolvibe.com/wp-content/uploads/2011/01/carlsonwkk-place-of-making-ship-992x558.jpg"
                },
                "fields": [
                    {
                        "name": ":map: Território utilizado para construção :map:",
                        "value": `**${args[1]}**`
                    },
                    {
                        "name": "Custo :moneybag: ",
                        "value": `**${reino.custo_barco}**`
                    },
                    {
                        "name": ":ocean: Mar de destino :ocean: ",
                        "value": `**${args[2]}**`
                    }
                ]
            };

            if (!dono) {
                return message.channel.send(`O territorio de origem não é seu`);
            }

            if (acao) {
                return message.channel.send(`Já existe uma ação registrada para esse territorio, espere a rodada acabar ou apague suas ações`);
            }

            // if (barco_construido) {
            //     return message.channel.send(`Já existe um barco do seu reino nesse mar`);
            // }

            if (reino.ouro < reino.custo_barco) {
                return message.channel.send(`Você não tem ouro para construir o barco`);
            }

            var mares_orig = orig.nome_mar.split(',')

            if (mares_orig.includes(mar)) {
                Acao.create({
                    rei: `${message.author.username}`,
                    reino: `${reino.nome_reino}`,
                    nome_acao: "construir",
                    origem: `${lugar}`,
                    destino: `${mar}`,
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                return message.channel.send({ embed });
            } else {

                //Teste para saber se existem barcos desocupados
                if (barcos.length <= reino.barcos_ocupados) {
                    return message.channel.send(`Os territórios não estão adjacentes e você não possui barcos para auxiliar.`);
                }

                var mares_controle = []

                var mares_dest = mar
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
                        retorno = func.mar_encontra_adjacente(M_orig, mar, mares_controle, adjacentes)
                        if (retorno) {
                            break
                        }
                    }
                }

                if (retorno) {
                    reino.increment('barcos_ocupados')
                    Acao.create({
                        rei: `${message.author.username}`,
                        reino: `${reino.nome_reino}`,
                        nome_acao: "construir",
                        origem: `${lugar}`,
                        destino: `${mar}`,
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                    return message.channel.send({ embed });
                }
            }
        } else {
            return message.channel.send(`Comando utilizado de forma incorreta`);
        }
    },
};