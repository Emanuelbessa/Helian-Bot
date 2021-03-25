const func = require('./funcoes.js');
const Acoes = require('../models/AcoesModel.js');
const AcoesBarco = require('../models/AcoesBarcoModel.js');
const Reinos = require('../models/ReinoModel.js');
const Barcos = require('../models/BarcosModel.js');
const AcoesBarcos = require('../models/AcoesBarcoModel.js');
const Mapas = require('../models/MapaModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Rodadas = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'atacar',
    description: 'Para atacar corretamente digite: !atacar origem destino. Todas as tropas do território de origem irão atacar',
    async execute(message, args) {
        //!atacar d5 barco mar reino
        var adjacentes = {
            'norte': ['leste', 'oeste'],
            'sul': ['leste', 'oeste'],
            'leste': ['norte', 'sul'],
            'oeste': ['norte', 'sul'],
        }
        if ([0, 1, 3].includes(args.length)) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nDigite:\n!atacar origem destino`);
        } else if (args[1] == 'barco') {
            //Lembrar que o nome do reino tem que estar idêntico(letras Maiusculas e minusculas)
            const origem = args[0].toLowerCase();
            const mar = args[2].toLowerCase();
            //const reino_atacado = args[3].toLowerCase();
            args.splice(0, 3)
            //Bug no ataqaue à barcos que tenhma mais de 2 nome no nome do reino?
            //Preciso testar
            const reino_atacado = args.join(" ")

            const Mapa = Mapas(sequelize, Sequelize);
            const Acao = Acoes(sequelize, Sequelize);
            const AcaoBarco = AcoesBarco(sequelize, Sequelize);
            const Barco = Barcos(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);

            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let acoes_barco = await AcaoBarco.findAll({ where: { nome_rei: `${message.author.username}`, rodada: `${rodadaatual[0].rodada_atual}` }, order: [['rei', 'DESC']], attributes: ['rei'], raw: true });
            let acoes = await Acao.findAll({ where: { nome_rei: `${message.author.username}`, rodada: `${rodadaatual[0].rodada_atual}` }, order: [['rei', 'DESC']], attributes: ['rei'], raw: true });
            let todos_reinos = await Reino.findAll({ order: [['rei', 'DESC']], attributes: ['rei', 'nome_reino'], raw: true });
            let reino = await Reino.findOne({ where: { rei: `${message.author.username}` } });
            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${origem}` } });
            let ataque = await Acao.findOne({ where: { rei: `${message.author.username}`, origem: `${origem}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let acao_barco = await AcaoBarco.findOne({ where: { rei: `${message.author.username}`, origem: `${origem}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let barcos = await Barco.findAll({ where: { nome_rei: `${message.author.username}` }, order: [['nome_rei', 'DESC']], attributes: ['nome_mar', 'nome_reino', 'nome_rei'], raw: true });
            let barco_atacado = await Barco.findOne({ where: { nome_reino: `${reino_atacado}`, nome_mar: `${mar}` }, attributes: ['nome_mar', 'nome_reino', 'nome_rei'], raw: true });
            let orig = await Mapa.findOne({ where: { nome_mapa: `${origem}` } });

            var acoes_totais = (acoes_barco ? acoes_barco.length : 0) + (acoes ? acoes.length : 0)

            if (acoes_totais >= func.quantidadeAcoes(todosterritorios.length)) {
                return message.channel.send(`Você atingiu o limite de ações nessa rodada`);
            }

            if (!dono) {
                return message.channel.send(`O territorio de origem não é seu`);
            }

            // if (ataque || acao_barco) {
            //     return message.channel.send(`Já existe uma ação registrada para esse territorio, espere a rodada acabar`);
            // }

            if (barcos.length <= reino.barcos_ocupados) {
                return message.channel.send(`Você não possui barcos para realizar esse ataque`);
            }

            var existe_reino = false
            for (const defaultElement of todos_reinos) {
                if (defaultElement.nome_reino == reino_atacado) {
                    existe_reino = true
                }
            }

            if (!existe_reino) {
                return message.channel.send(`Esse reino não existe, certifique-se que ele está digitado corretamente`);
            }

            if (!barco_atacado) {
                return message.channel.send(`Esse reino não tem barco no mar selecionado`);
            }

            var mares_controle = []
            var mares_orig = orig.nome_mar.split(',')
            var mares_dest = mar
            barcos.forEach(element => {
                mares_controle.push(element.nome_mar)
            });

            var retorno = false
            for (let a = 0; a < mares_orig.length; a++) {
                var M_orig = mares_orig[a]
                retorno = func.mar_encontra_caminho(M_orig, mares_dest, mares_controle, adjacentes)
                if (retorno) {
                    break
                }
            }

            if (retorno) {
                reino.increment('barcos_ocupados')
                AcaoBarco.create({
                    rei: `${message.author.username}`,
                    reino: `${reino.nome_reino}`,
                    nome_acao: "atacar_barco",
                    origem: `${origem}`,
                    destino: mar,
                    reino_alvo: `${reino_atacado}`,
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                return message.channel.send(`Ação de ataque registrada. Para ver suas ações nesta rodada, digite !acao ver`);
            } else {
                return message.channel.send(`Você não tem acesso ao mar selecionado`);
            }
        } else if (args.length == 2) {

            const origem = args[0].toLowerCase();
            const destino = args[1].toLowerCase();

            const Mapa = Mapas(sequelize, Sequelize);
            const Acao = Acoes(sequelize, Sequelize);
            const Barco = Barcos(sequelize, Sequelize);
            const AcaoBarco = AcoesBarco(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);

            let todos_territorios_atacante = await Territorio.findAll({ where: { rei: `${message.author.username}` }, order: [['rei', 'DESC']], attributes: ['rei', 'localizacao', 'nome_territorio'], raw: true });
            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let acoes_barco = await AcaoBarco.findAll({ where: { rei: `${message.author.username}`, rodada: `${rodadaatual[0].rodada_atual}` }, order: [['rei', 'DESC']], attributes: ['rei'], raw: true });
            let acoes = await Acao.findAll({ where: { rei: `${message.author.username}`, rodada: `${rodadaatual[0].rodada_atual}` }, order: [['rei', 'DESC']], attributes: ['rei'], raw: true });
            let reino = await Reino.findOne({ where: { rei: `${message.author.username}` } });
            let acao_barco = await AcaoBarco.findOne({ where: { rei: `${message.author.username}`, nome_acao: 'usar_barco_ataque', origem: `${origem}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let barcos = await Barco.findAll({ where: { nome_rei: `${message.author.username}` }, order: [['nome_rei', 'DESC']], attributes: ['nome_mar', 'nome_reino', 'nome_rei'], raw: true });
            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${origem}` } });
            let ataque = await Acao.findOne({ where: { rei: `${message.author.username}`, nome_acao: 'atacar', origem: `${origem}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let orig = await Mapa.findOne({ where: { nome_mapa: `${origem}` } });
            let dest = await Mapa.findOne({ where: { nome_mapa: `${destino}` } });

            var acoes_totais = (acoes_barco ? acoes_barco.length : 0) + (acoes ? acoes.length : 0)

            if (acoes_totais >= func.quantidadeAcoes(todos_territorios_atacante.length)) {
                return message.channel.send(`Você atingiu o limite de ações nessa rodada`);
            }

            if (!dono) {
                return message.channel.send(`O territorio de origem não é seu`);
            }

            for (let i = 0; i < todos_territorios_atacante.length; i++) {
                if (todos_territorios_atacante[i].localizacao == destino) {
                    return message.channel.send(`O territorio de destino é seu, Quer matar o seu próprio povo?\nVocê não pode fazer isso.`);
                }
            }

             if (ataque || acao_barco) {
                return message.channel.send(`Já existe uma ação registrada para esse territorio, espere a rodada acabar`);
            }

            if (func.adjacente(orig.x, orig.y, dest.x, dest.y)) {
                if (dono.tropas == 0 && dono.arqueiros == 0) {
                    return message.channel.send(`Você não possui tropas suficientes para realizar um ataque`);
                }

                Acao.create({
                    rei: `${message.author.username}`,
                    reino: `${reino.nome_reino}`,
                    nome_acao: "atacar",
                    tropas: `${dono.dataValues.tropas}`,
                    arqueiros: `${dono.dataValues.arqueiros}`,
                    origem: `${origem}`,
                    destino: `${destino}`,
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                return message.channel.send(`Ação de ataque registrada. Para ver suas ações nesta rodada, digite !acao ver`);
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
                    rei: `${message.author.username}`,
                    reino: `${reino.nome_reino}`,
                    nome_acao: "usar_barco_ataque",
                    tropas: `${dono.dataValues.tropas}`,
                    arqueiros: `${dono.dataValues.arqueiros}`,
                    origem: `${origem}`,
                    destino: `${destino}`,
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                return message.channel.send(`Ação de ataque registrada. Para ver suas ações nesta rodada, digite !acao ver`);
            } else {
                return message.channel.send(`Os territórios não estão adjacentes e você não possui barcos para auxiliar.`);
            }
        } else {
            return message.channel.send(`Comando utilizado de forma errada`);
        }
    },
};