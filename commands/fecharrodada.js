const func = require('./funcoes.js');
const Acoes = require('../models/AcoesModel.js');
const AcoesTrasnf = require('../models/AcoesTransferirModel.js');
const Cotacoes = require('../models/CotacoesModel.js');
const AcoesBarco = require('../models/AcoesBarcoModel.js');
const Barcos = require('../models/BarcosModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Mapas = require('../models/MapaModel.js');
const Reinos = require('../models/ReinoModel.js');
const Relatorios = require('../models/RelatorioModel.js');
const Rodadas = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
const { Op } = require("sequelize");
const reino = require('./reino.js');
module.exports = {
    name: 'fecharrodada',
    description: 'Digite: !fecharrodada  para fechar a rodada. Atenção! Você provavelmente não tem autorização para isso.',
    async execute(message, args) {
        const { commands } = message.client;
        if (message.author.username != "Emanuel") {
            return message.channel.send('Você não tem permissão para usar o comando')
        } else {
            var loc_especiais = ['d3', 'd4']
            var recursospossiveis = ['ferro', 'madeira', 'tecido', 'oleo', 'trigo']
            var loc_especiais_num = [
                D3 = { x: 4, y: 3 },
                D4 = { x: 4, y: 4 }
            ]

            const Acao = Acoes(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            const Relatorio = Relatorios(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);
            const AcaoBarco = AcoesBarco(sequelize, Sequelize);
            const AcaoTransf = AcoesTrasnf(sequelize, Sequelize);
            const Barco = Barcos(sequelize, Sequelize);
            const Mapa = Mapas(sequelize, Sequelize);
            const Cotacao = Cotacoes(sequelize, Sequelize);

            let todos_reinos = await Reino.findAll({ order: [['rei', 'DESC']], attributes: ['rei', 'nome_reino'], raw: true });
            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            var acoes = await Acao.findAll({ where: { nome_acao: ['atacar', 'apoiar'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'apoio', 'tropas', 'arqueiros', 'rei', 'origem', 'destino'], raw: true });
            var coletas = await Acao.findAll({ where: { nome_acao: ['coletar'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'rei', 'origem'], raw: true });
            var construcao = await Acao.findAll({ where: { nome_acao: ['construir'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'rei', 'origem', 'destino'], raw: true });
            var transferencia = await AcaoTransf.findAll({ where: { nome_acao: ['transferir'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'tropas', 'arqueiros', 'rei', 'origem', 'destino', 'ouro', 'trigo', 'oleo', 'ferro', 'madeira', 'tecido'], raw: true });
            var atacar_barco = await AcaoBarco.findAll({ where: { nome_acao: ['atacar_barco'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'rei', 'origem', 'reino', 'destino', 'reino_alvo'], raw: true });
            var usar_barco_ataque = await AcaoBarco.findAll({ where: { nome_acao: ['usar_barco_ataque'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'rei', 'nome_acao', 'apoio', 'tropas', 'arqueiros', 'origem', 'destino'], raw: true });
            var usar_barco_apoio = await AcaoBarco.findAll({ where: { nome_acao: ['usar_barco_apoio'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'apoio', 'tropas', 'arqueiros', 'rei', 'origem', 'destino'], raw: true });
            var terr_especiais = await Territorio.findAll({ where: { localizacao: [loc_especiais] }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });

            var ATACANTES = [];
            var DEFENSORES = [];
            var APOIADOR = [];
            var APOIADO = [];
            var MotivoA = []; // Atacar e Defender
            var MotivoB = []; // 2x No mesmo território
            var MotivoC = []; // Tentativa de Apoio falhou
            var reis_especiais = terr_especiais.map(param => param.rei)

            /*
            Tipos de relatório:
            1. Ataque sem resistencia (PVE)
            2. Ataques PVP sucesso
            3. Ataques PVP falha
            4. Ataques PVP recuando por ser atacado
            5. Ataque PVP recuando por ter outra nação atacando
            6. Defesa PVP sucesso
            7. Defesa PVP falha
            8. Defesa PVP quase ataque 2x+
            9. Defesa PVP quase ataque sem motivo aparente
            10. Tentativa de Apoio - Fui atacado
            11. Apoios Bem sucedidos
            12. Apoios Mal sucedidos
            13. Apoiado

            **. Mensagem de "ataquei um barco x, mas o reino alvo também atacou" 
            **. Mensagem de "ataquei um barco x e destruí o barco do reino alvo" 
            */

            //Ação de construir barcos
            for (let i = 0; i < construcao.length; i++) {
                let reino = await Reino.findOne({ where: { rei: `${construcao[i].rei}` }, attributes: ['nome_reino', 'rei', 'custo_barco'], raw: true });
                if (reino.ouro < reino.custo_barco) {
                    continue
                    //Relatório de não tem dinheiro
                }
                Reino.decrement('ouro', { by: reino.custo_barco, where: { nome_reino: reino.nome_reino } });
                //Reino.increment('custo_barco', { by: 1, where: { nome_reino: reino.nome_reino } });

                Barco.create({
                    nome_rei: `${construcao[i].rei}`,
                    nome_reino: `${reino.nome_reino}`,
                    nome_mar: `${construcao[i].destino}`,
                });
            }
            //- Ação de destruir os barcos, marcar quais barcos serão destruídos
            if (atacar_barco) {
                var destruidos = []
                for (let i = 0; i < atacar_barco.length; i++) {
                    for (let k = 0; k < atacar_barco.length; k++) {
                        if (atacar_barco[i].destino == atacar_barco[k].destino && atacar_barco[i].reino_alvo == atacar_barco[k].reino) {
                            //Os reinos estão atacando o mesmo mar, ou seja, a ação de ambos não vai acontecer
                            //Não importa a quantidade de vezes que esse reino for atacado nesse mar, logo, bata eu encontrar uma vez para invalidar esse ataque
                            break
                        }
                        if ((k + 1) == atacar_barco.length) {
                            if (!destruidos.includes(atacar_barco[i])) {
                                destruidos.push(atacar_barco[i])
                            }
                        }
                    }
                }
            }
            //Destruir todos os barcos marcados
            for (let i = 0; i < destruidos.length; i++) {
                Barco.destroy({ where: { nome_reino: `${destruidos[i].reino_alvo}`, nome_mar: `${destruidos[i].destino}` } })
            }
            //Ação de tranferencia de ouro
            for (let i = 0; i < transferencia.length; i++) {
                let reino = await Reino.findOne({ where: { nome_reino: `${transferencia[i].destino}` }, attributes: ['nome_reino', 'rei', 'custo_barco', 'ferro', 'trigo', 'tecido', 'oleo', 'madeira'], raw: true });

                Reino.decrement('ferro', { by: transferencia[i].ferro, where: { rei: transferencia[i].rei } });
                Reino.decrement('trigo', { by: transferencia[i].trigo, where: { rei: transferencia[i].rei } });
                Reino.decrement('madeira', { by: transferencia[i].madeira, where: { rei: transferencia[i].rei } });
                Reino.decrement('tecido', { by: transferencia[i].tecido, where: { rei: transferencia[i].rei } });
                Reino.decrement('oleo', { by: transferencia[i].oleo, where: { rei: transferencia[i].rei } });
                Reino.increment('ferro', { by: transferencia[i].ferro, where: { nome_reino: reino.nome_reino } });
                Reino.increment('trigo', { by: transferencia[i].trigo, where: { nome_reino: reino.nome_reino } });
                Reino.increment('madeira', { by: transferencia[i].madeira, where: { nome_reino: reino.nome_reino } });
                Reino.increment('tecido', { by: transferencia[i].tecido, where: { nome_reino: reino.nome_reino } });
                Reino.increment('oleo', { by: transferencia[i].oleo, where: { nome_reino: reino.nome_reino } });
            }
            //Realizar Re-test apenas com os reinos que tiveram barcos destruidos - AÇÃO DE ATAQUE
            const reis_barcos_destruidos = destruidos.map(param => param.rei);
            for (let i = 0; i < usar_barco_ataque.length; i++) {
                if (reis_barcos_destruidos.includes(usar_barco_ataque[i].reino_alvo)) {
                    let orig = await Mapa.findOne({ where: { nome_mapa: `${usar_barco_ataque[i].origem}` } });
                    let dest = await Mapa.findOne({ where: { nome_mapa: `${usar_barco_ataque[i].destino}` } });
                    let barcos = await Barco.findAll({ where: { nome_reino: `${usar_barco_ataque[i].reino}` }, order: [['nome_rei', 'DESC']], attributes: ['nome_mar', 'nome_reino', 'nome_rei'], raw: true });

                    let mares_controle = []
                    let mares_orig = orig.nome_mar.split(',')
                    let mares_dest = dest.nome_mar.split(',')

                    barcos.forEach(element => {
                        mares_controle.push(element.nome_mar)
                    });

                    let retorno = false
                    for (let a = 0; a < mares_orig.length; a++) {
                        for (let b = 0; b < mares_dest.length; b++) {
                            let M_orig = mares_orig[a]
                            let M_dest = mares_dest[b]
                            retorno = func.mar_encontra_caminho(M_orig, M_dest, mares_controle, adjacentes)
                            if (retorno) {
                                break
                            }
                        }
                    }
                    //Incluir marcação que esse ataque foi feito com barcos para permitir deixar tropas caso vença a batalha no futuro
                    if (retorno) {
                        usar_barco_ataque[i].nome_acao = 'atacar'
                        acoes.push(usar_barco_ataque[i])
                    }//else{
                    //sua ação foi cancelada porque o barco utilizado para realizada foi destruido
                    //}
                } else {
                    usar_barco_ataque[i].nome_acao = 'atacar'
                    acoes.push(usar_barco_ataque[i])
                }
            }
            console.log('Aqui-0');
            //Realizar Re-test apenas com os reinos que tiveram barcos destruidos - AÇÃO DE APOIO
            for (let i = 0; i < usar_barco_apoio.length; i++) {
                if (reis_barcos_destruidos.includes(usar_barco_apoio[i].rei)) {

                    let orig = await Mapa.findOne({ where: { nome_mapa: `${usar_barco_apoio[i].origem}` } });
                    let dest = await Mapa.findOne({ where: { nome_mapa: `${usar_barco_apoio[i].destino}` } });
                    let barcos = await Barco.findAll({ where: { nome_reino: `${usar_barco_apoio[i].reino}` }, order: [['nome_rei', 'DESC']], attributes: ['nome_mar', 'nome_reino', 'nome_rei'], raw: true });

                    let mares_controle = []
                    let mares_orig = orig.nome_mar.split(',')
                    let mares_dest = dest.nome_mar.split(',')

                    barcos.forEach(element => {
                        mares_controle.push(element.nome_mar)
                    });

                    let retorno = false
                    for (let a = 0; a < mares_orig.length; a++) {
                        for (let b = 0; b < mares_dest.length; b++) {
                            let M_orig = mares_orig[a]
                            let M_dest = mares_dest[b]
                            retorno = func.mar_encontra_caminho(M_orig, M_dest, mares_controle, adjacentes)
                            if (retorno) {
                                break
                            }
                        }
                    }
                    //Incluir marcação que esse ataque foi feito com barcos para permitir deixar tropas caso vença a batalha no futuro
                    if (retorno) {
                        usar_barco_apoio[i].nome_acao = 'apoiar'
                        acoes.push(usar_barco_apoio[i])
                    }//else{
                    //sua ação foi cancelada porque o barco utilizado para realizada foi destruido
                    //}
                } else {
                    usar_barco_apoio[i].nome_acao = 'apoiar'
                    acoes.push(usar_barco_apoio[i])
                }
            }

            //Evento dos Bárbaros atacando
            if (rodadaatual[0].rodada_atual >= 4) {

                for (let index = 0; index < loc_especiais.length; index++) {

                    let territo = await Territorio.findOne({ where: { localizacao: loc_especiais[index] }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });
                    if (territo.rei != 'Natureza') {
                        continue
                    }

                    var adj = func.adjacenteStr(loc_especiais_num[index].x, loc_especiais_num[index].y)
                    var adjsLetras = []

                    for (let i = 0; i < adj.length; i++) {
                        adjsLetras.push(func.numerosParaLetras(parseInt(adj[i].split('')[0]), adj[i].split('')[1]))
                    }

                    var territorioatacado = adjsLetras[Math.floor(Math.random() * adjsLetras.length)];
                    while (loc_especiais.includes(territorioatacado)) {
                        var territorioatacado = adjsLetras[Math.floor(Math.random() * adjsLetras.length)];
                    }
                    var from = func.numerosParaLetras(loc_especiais_num[index].x, loc_especiais_num[index].y)
                    var barb_especiais = await Territorio.findOne({ where: { localizacao: `${from}` } });

                    Acao.create({
                        rei: `Barbaros Especiais`,
                        reino: `Natureza`,
                        nome_acao: "atacar",
                        tropas: `${barb_especiais.tropas}`,
                        arqueiros: `${barb_especiais.arqueiros}`,
                        origem: `${from}`,
                        destino: `${territorioatacado}`,
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                    var acoes_barbaros = {
                        rei: 'Barbaros Especiais',
                        nome_acao: 'atacar',
                        tropas: barb_especiais.tropas,
                        arqueiros: barb_especiais.arqueiros,
                        origem: from,
                        destino: territorioatacado,
                        rodada: rodadaatual[0].rodada_atual
                    }
                    acoes.push(acoes_barbaros)
                }
            }


            for (var i = 0; i < acoes.length; i++) {
                if (acoes[i].nome_acao == 'atacar') {
                    ATACANTES.push(acoes[i].origem);
                    DEFENSORES.push(acoes[i].destino);
                }
                if (acoes[i].nome_acao == 'apoiar') {

                    APOIADOR.push(acoes[i].origem);
                    APOIADO.push(acoes[i].destino);
                }
            }
            // Testando quem vai cair no MotivoA para depois testar o MotivoB
            for (var i = 0; i < acoes.length; i++) {
                if (ATACANTES.includes(acoes[i].origem) && DEFENSORES.includes(acoes[i].origem)) {
                    MotivoA.push(acoes[i]);
                }
            }
            // Criando os Relatórios do Motivo A
            for (let i = 0; i < MotivoA.length; i++) {
                let territo = await Territorio.findOne({ where: { localizacao: `${MotivoA[i].destino}` }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });
                // Ataques PVP recuando por ser atacado
                Relatorio.create({
                    rei: `${MotivoA[i].rei}`,
                    origem: `${MotivoA[i].origem}`,
                    destino: `${MotivoA[i].destino}`,
                    mensagem: '4',
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                // Defesa PVP quase ataque sem motivo aparente
                if (territo) {
                    Relatorio.create({
                        rei: `${territo.rei}`,
                        origem: `${MotivoA[i].origem}`,
                        destino: `${MotivoA[i].destino}`,
                        mensagem: '9',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                }
            }
            console.log("Ponto 1");
            // Removendo ações invalidadas pelo motivo A do Array de acoes
            acoes = acoes.filter(function (el, i) {
                return MotivoA.indexOf(el) < 0
            })
            console.log("Ponto 2");
            var ATACANTES = [];
            var DEFENSORES = [];
            var APOIADOR = [];
            var APOIADO = [];

            for (var i = 0; i < acoes.length; i++) {
                if (acoes[i].nome_acao == 'atacar') {
                    ATACANTES.push(acoes[i].origem);
                    DEFENSORES.push(acoes[i].destino);
                }
                if (acoes[i].nome_acao == 'apoiar') {
                    APOIADOR.push(acoes[i].origem);
                    APOIADO.push(acoes[i].destino);
                }
            }
            // Começando fase de testes do Motivo B
            let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)
            var defensorduplicado = findDuplicates(DEFENSORES)

            for (var i = 0; i < acoes.length; i++) {
                for (var k = 0; k < defensorduplicado.length; k++) {
                    if (acoes[i].destino == defensorduplicado[k]) {
                        MotivoB.push(acoes[i])
                    }
                }
            }
            // Criando os Relatórios do Motivo B
            for (let i = 0; i < MotivoB.length; i++) {
                let territorio = await Territorio.findOne({ where: { localizacao: `${MotivoB[i].destino}` }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });
                // Ataque PVP recuando por ter outra nação atacando
                Relatorio.create({
                    rei: `${MotivoB[i].rei}`,
                    origem: `${MotivoB[i].origem}`,
                    destino: `${MotivoB[i].destino}`,
                    mensagem: '5',
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                // Defesa PVP quase ataque 2x+
                if (territorio) {
                    Relatorio.create({
                        rei: `${territorio.rei}`,
                        origem: `${MotivoB[i].origem}`,
                        destino: `${MotivoB[i].destino}`,
                        mensagem: '8',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                }
            }
            console.log("Ponto 3");
            // Removendo ações invalidadas pelo motivo B do Array de acoes
            acoes = acoes.filter(function (el, i) {
                return MotivoB.indexOf(el) < 0
            })
            console.log("Ponto 4");
            var app = acoes.filter(function (a) {
                return a.nome_acao == 'atacar'
            })
            var apoios = acoes.filter(function (a) {
                return a.nome_acao == 'apoiar'
            })
            console.log("Ponto teste");
            //Testando quem vai cair no Motivo C
            for (var i = 0; i < app.length; i++) {
                for (var k = 0; k < apoios.length; k++) {
                    if (app[i].destino == apoios[k].origem) {
                        MotivoC.push(apoios[k])
                    }
                }
            }
            console.log("Ponto teste2");
            // Criando os Relatórios do Motivo C
            for (let i = 0; i < MotivoC.length; i++) {
                // Tentativa de Apoio Falha - Fui atacado
                Relatorio.create({
                    rei: `${MotivoC[i].rei}`,
                    origem: `${MotivoC[i].origem}`,
                    destino: `${MotivoC[i].destino}`,
                    mensagem: '10',
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
            }
            console.log("Ponto 5");
            // Removendo ações invalidadas pelo motivo C do Array de acoes
            acoes = acoes.filter(function (el) {
                return MotivoC.indexOf(el) < 0;
            });
            console.log("Ponto 6");

            var apoiadores = acoes.filter(function (a) {
                return a.nome_acao == 'apoiar'
            });

            var ATACANTES = [];
            var DEFENSORES = [];
            var APOIADOR = [];
            var APOIADO = [];
            console.log("Ponto 7");
            for (var i = 0; i < acoes.length; i++) {

                if (acoes[i].nome_acao == 'atacar') {
                    ATACANTES.push(acoes[i].origem);
                    DEFENSORES.push(acoes[i].destino);
                }
                if (acoes[i].nome_acao == 'apoiar') {

                    APOIADOR.push(acoes[i].origem);
                    APOIADO.push(acoes[i].destino);
                }
            }
            console.log("Ponto 8");
            // Se o destino do apoio não é origem ou destino de um ataque, bem sucedido / apoiado
            // A conquista PVE deve ser parte do for do PVP, pois existe a possiblidade de alguém apoiar o território vazio
            for (let i = 0; i < apoiadores.length; i++) {
                if (!DEFENSORES.includes(apoiadores[i].destino)) {
                    let sup = await Territorio.findOne({ where: { localizacao: `${apoiadores[i].destino}` }, attributes: ['localizacao', 'rei'], raw: true });
                    Relatorio.create({
                        rei: `${apoiadores[i].rei}`,
                        origem: `${apoiadores[i].origem}`,
                        destino: `${apoiadores[i].destino}`,
                        mensagem: '11',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                    if (sup) {
                        Relatorio.create({
                            rei: `${sup.rei}`,
                            origem: `${apoiadores[i].origem}`,
                            destino: `${apoiadores[i].destino}`,
                            mensagem: '13',
                            rodada: `${rodadaatual[0].rodada_atual}`
                        });
                    }

                }
            }
            console.log("Ponto 9");
            // PVPs que de fato aconteceram
            for (let i = 0; i < acoes.length; i++) {
                if (acoes[i].nome_acao == 'atacar') {
                    var terr = await Territorio.findOne({ where: { localizacao: acoes[i].destino }, attributes: ['localizacao', 'tropas', 'arqueiros', 'rei'], raw: true });

                    var ataque = acoes[i].tropas + acoes[i].arqueiros
                    if (terr) {
                        var defesa = terr.tropas + (terr.arqueiros * 3)
                    } else {
                        var defesa = 0
                    }
                    var apoioatk = false
                    var apoiodef = false

                    if (APOIADO.includes(acoes[i].destino)) {

                        var auxatq = apoiadores.filter(function (a) {
                            return a.apoio === "ataque" && a.destino == acoes[i].destino
                        });

                        var auxdef = apoiadores.filter(function (a) {
                            return a.apoio === "defesa" && a.destino == acoes[i].destino
                        });

                        if (auxatq.length >= 1) {
                            var a = 0
                            auxatq.forEach(function (t, indice) {
                                a = a + t.tropas
                            })
                            //add força dos arqueiros no atk (1)
                            auxatq.forEach(function (t, indice) {
                                a = a + t.arqueiros
                            })

                            ataque = ataque + a
                            apoioatk = true
                        }

                        if (auxdef.length >= 1) {
                            var d = 0
                            auxdef.forEach(function (t, indice) {
                                d = d + t.tropas
                            })

                            auxdef.forEach(function (t, indice) {
                                d = d + (t.arqueiros * 3)
                            })

                            defesa = defesa + d
                            apoiodef = true
                        }
                    }

                    if (ataque > defesa) {
                        if (terr.rei == 'Natureza') {
                            // Primeiro Caso de ataque Bem sucedido, PVE
                            Relatorio.create({
                                rei: `${acoes[i].rei}`,
                                origem: `${acoes[i].origem}`,
                                destino: `${acoes[i].destino}`,
                                mensagem: '1',
                                rodada: `${rodadaatual[0].rodada_atual}`
                            });
                            let terr2 = await Territorio.findOne({ where: { localizacao: `${acoes[i].origem}` }, attributes: ['localizacao', 'tropas', 'rei', 'nome_territorio'], raw: true });
                            Territorio.update({
                                rei: `${acoes[i].rei}`,
                                nome_territorio: `${terr2.nome_territorio}`,
                                tropas: `0`,
                                arqueiros: `0`
                            }, {
                                where: { localizacao: `${acoes[i].destino}` }
                            });
                            //Diminuir Tropas de acordo com o ataque à natureza
                            Territorio.update({
                                tropas: acoes[i].tropas - terr.tropas,
                                arqueiros: `0`
                            }, {
                                where: { localizacao: `${acoes[i].origem}` }
                            });

                            var recurso1 = recursospossiveis[Math.floor(Math.random() * recursospossiveis.length)];
                            var recurso2 = recursospossiveis[Math.floor(Math.random() * recursospossiveis.length)];

                            Reino.increment(`${recurso1}`, { by: 1, where: { nome_reino: `${terr2.nome_territorio}` } });
                            Reino.increment(`${recurso2}`, { by: 1, where: { nome_reino: `${terr2.nome_territorio}` } });

                            //Reino.increment('ouro', { by: 6, where: { nome_reino: `${terr2.nome_territorio}` } });

                        } else {
                            Relatorio.create({
                                rei: `${acoes[i].rei}`,
                                origem: `${acoes[i].origem}`,
                                destino: `${acoes[i].destino}`,
                                mensagem: '2',
                                rodada: `${rodadaatual[0].rodada_atual}`
                            });
                            Relatorio.create({
                                rei: `${terr.rei}`,
                                origem: `${acoes[i].origem}`,
                                destino: `${acoes[i].destino}`,
                                mensagem: '7',
                                rodada: `${rodadaatual[0].rodada_atual}`
                            });
                        }
                        //Criando o Relatório para as pessoas que defenderam e zerando suas tropas (lado perdedor)
                        if (apoiodef) {
                            auxdef.forEach(function (t, indice) {
                                if (terr) {
                                    Relatorio.create({
                                        rei: `${terr.rei}`,
                                        origem: `${t.origem}`,
                                        destino: `${acoes[i].destino}`,
                                        mensagem: '13',
                                        rodada: `${rodadaatual[0].rodada_atual}`
                                    });
                                }
                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '12',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })
                            auxdef.forEach(function (v, i) {
                                Territorio.update({
                                    tropas: `0`,
                                    arqueiros: `0`

                                }, {
                                    where: { localizacao: `${v.origem}` }
                                });
                            })
                        }
                        //Mudando o Rei do território para o nome do rei vencedor
                        let reino = await Reino.findOne({ where: { rei: `${acoes[i].rei}` }, attributes: ['nome_reino', 'rei', 'custo_barco', 'ouro'], raw: true });
                        console.log(reino);
                        Territorio.update({
                            rei: `${acoes[i].rei}`,
                            nome_territorio: `${reino.nome_reino}`,
                            tropas: `0`,
                            arqueiros: `0`,
                        }, {
                            where: { localizacao: `${acoes[i].destino}` }
                        });
                        //Criando o Relatório para as pessoas que ajudaram a atacar e reduzindo suas tropas (lado vencedor)
                        if (apoioatk) {
                            auxatq.forEach(function (t, indice) {
                                Relatorio.create({
                                    rei: `${acoes[i].rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '13',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '11',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })


                            var prejuizo = defesa

                            console.log('ponto 10');
                            while (prejuizo >= 1) {

                                if (acoes[i].tropas != 0) {
                                    acoes[i].tropas--
                                    prejuizo--
                                } else if (acoes[i].arqueiros != 0) {
                                    acoes[i].arqueiros--
                                    prejuizo--
                                    prejuizo--
                                    prejuizo--
                                }

                                for (let q = 0; q < auxatq.length; q++) {
                                    if (prejuizo >= 1 && auxatq[q].tropas >= 1) {
                                        auxatq[q].tropas--
                                        prejuizo--
                                    } else if (prejuizo >= 1 && auxatq[q].arqueiros >= 1) {
                                        auxatq[q].arqueiros--
                                        prejuizo--
                                        prejuizo--
                                        prejuizo--
                                    }
                                }
                            }
                            //Pode melhorar performance, att mesmo com def = 0
                            auxatq.forEach(function (n, i) {
                                Territorio.update({
                                    tropas: `${n.tropas}`,
                                    arqueiros: `${n.arqueiros}`
                                }, {
                                    where: { localizacao: `${n.origem}` }
                                });
                            })

                            Territorio.update({
                                tropas: `${acoes[i].tropas}`,
                                arqueiros: `${acoes[i].arqueiros}`
                            }, {
                                where: { localizacao: `${acoes[i].origem}` }
                            });
                        } else {
                            //Atualizando tropas do atacante, nesse caso, não houve apoios
                            var novastropas = defesa

                            while (novastropas >= 1) {
                                if (acoes[i].tropas != 0) {
                                    acoes[i].tropas--
                                    novastropas--
                                } else if (acoes[i].arqueiros != 0) {
                                    acoes[i].arqueiros--
                                    novastropas--
                                }
                            }

                            Territorio.update({
                                tropas: `${acoes[i].tropas}`,
                                arqueiros: `${acoes[i].arqueiros}`
                            }, {
                                where: { localizacao: `${acoes[i].origem}` }
                            });
                        }
                    } else {
                        //Criando o Relatório para as pessoas que defenderam (lado vencedor)
                        Relatorio.create({
                            rei: `${acoes[i].rei}`,
                            origem: `${acoes[i].origem}`,
                            destino: `${acoes[i].destino}`,
                            mensagem: '3',
                            rodada: `${rodadaatual[0].rodada_atual}`
                        });
                        if (terr) {
                            Relatorio.create({
                                rei: `${terr.rei}`,
                                origem: `${acoes[i].origem}`,
                                destino: `${acoes[i].destino}`,
                                mensagem: '6',
                                rodada: `${rodadaatual[0].rodada_atual}`
                            });
                        }
                        //Criando o Relatório para as pessoas que ajudaram a defenderam e reduzindo suas tropas
                        if (apoiodef) {
                            auxdef.forEach(function (t, indice) {
                                if (terr) {
                                    Relatorio.create({
                                        rei: `${terr.rei}`,
                                        origem: `${t.origem}`,
                                        destino: `${acoes[i].destino}`,
                                        mensagem: '13',
                                        rodada: `${rodadaatual[0].rodada_atual}`
                                    });
                                }
                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '11',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })

                            var prejuizo = ataque
                            //erro do natureza
                            if (!terr) {
                                while (prejuizo >= 1) {
                                    for (let q = 0; q < auxdef.length; q++) {

                                        if (auxdef[q].tropas != 0) {
                                            auxdef[q].tropas--
                                            prejuizo--
                                        } else if (auxdef[q].arqueiros != 0) {
                                            auxdef[q].arqueiros--
                                            prejuizo--
                                            prejuizo--
                                            prejuizo--
                                        }
                                    }
                                }
                            } else {
                                while (prejuizo >= 1) {
                                    if (terr.tropas != 0) {
                                        terr.tropas--
                                        prejuizo--
                                    } else if (terr.arqueiros != 0) {
                                        auxdef[q].arqueiros--
                                        prejuizo--
                                        prejuizo--
                                        prejuizo--
                                    }

                                    for (let q = 0; q < auxdef.length; q++) {
                                        if (prejuizo >= 1 && auxdef[q].tropas >= 1) {
                                            auxdef[q].tropas--
                                            prejuizo--
                                        } else if (prejuizo >= 1 && auxdef[q].arqueiros >= 1) {
                                            auxdef[q].arqueiros--
                                            prejuizo--
                                            prejuizo--
                                            prejuizo--
                                        }
                                    }
                                }
                            }

                            auxdef.forEach(function (n, i) {
                                Territorio.update({
                                    tropas: `${n.tropas}`,
                                    arqueiros: `${n.arqueiros}`
                                }, {
                                    where: { localizacao: `${n.origem}` }
                                });
                            })
                            if (terr) {
                                Territorio.update({
                                    tropas: `${terr.tropas}`,
                                    arqueiros: `${terr.arqueiros}`
                                }, {
                                    where: { localizacao: `${acoes[i].destino}` }
                                });
                            }

                        } else {
                            var novastropas = ataque

                            while (novastropas >= 1) {
                                if (terr.tropas != 0) {
                                    terr.tropas--
                                    novastropas--
                                } else if (terr.arqueiros != 0) {
                                    terr.arqueiros--
                                    novastropas--
                                    novastropas--
                                    novastropas--
                                }
                            }
                            Territorio.update({
                                tropas: `${terr.tropas}`,
                                arqueiros: `${terr.arqueiros}`
                            }, {
                                where: { localizacao: `${acoes[i].destino}` }
                            });
                        }

                        if (apoioatk) {
                            auxatq.forEach(function (t, indice) {
                                Relatorio.create({
                                    rei: `${acoes[i].rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '13',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '12',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })
                            auxatq.forEach(function (n, i) {
                                Territorio.update({
                                    tropas: `0`,
                                    arqueiros: `0`
                                }, {
                                    where: { localizacao: `${n.origem}` }
                                });
                            })
                        }
                        Territorio.update({
                            tropas: `0`,
                            arqueiros: `0`
                        }, {
                            where: { localizacao: `${acoes[i].origem}` }
                        });
                    }
                }
            }
            //Dando a grana dos territórios especiais
            for (let i = 0; i < reis_especiais.length; i++) {
                if (reis_especiais[i] != 'Natureza') {
                    let reino = await Reino.findOne({ where: { rei: `${reis_especiais[i]}` }, attributes: ['nome_reino', 'rei', 'ouro'], raw: true });

                    var recurso1 = recursospossiveis[Math.floor(Math.random() * recursospossiveis.length)];
                    var recurso2 = recursospossiveis[Math.floor(Math.random() * recursospossiveis.length)];

                    Reino.increment(`${recurso1}`, { by: 1, where: { rei: reino.rei } });
                    Reino.increment(`${recurso2}`, { by: 1, where: { rei: reino.rei } });
                    //    Reino.increment('ouro', { by: 10, where: { nome_reino: reino.nome_reino } })
                }
            }

            //Dando a grana das coletas Ativas
            for (let i = 0; i < coletas.length; i++) {
                let todosterritorios = await Territorio.findAll({ order: [['rei', 'DESC']], attributes: ['localizacao', 'rei', 'nome_territorio'], where: { rei: `${coletas[i].rei}` }, raw: true });
                let territorio = await Territorio.findOne({ where: { localizacao: `${coletas[i].origem}` }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });

                if (todosterritorios.length >= 5) {

                    var recurso1 = recursospossiveis[Math.floor(Math.random() * recursospossiveis.length)];
                    var recurso2 = recursospossiveis[Math.floor(Math.random() * recursospossiveis.length)];

                    Reino.increment(`${recurso1}`, { by: 1, where: { rei: `${territorio.rei}` } });
                    Reino.increment(`${recurso2}`, { by: 1, where: { rei: `${territorio.rei}` } });
                } else {
                    var recurso1 = recursospossiveis[Math.floor(Math.random() * recursospossiveis.length)];
                    var recurso2 = recursospossiveis[Math.floor(Math.random() * recursospossiveis.length)];
                    var recurso3 = recursospossiveis[Math.floor(Math.random() * recursospossiveis.length)];

                    Reino.increment(`${recurso1}`, { by: 1, where: { rei: `${territorio.rei}` } });
                    Reino.increment(`${recurso2}`, { by: 1, where: { rei: `${territorio.rei}` } });
                    Reino.increment(`${recurso3}`, { by: 1, where: { rei: `${territorio.rei}` } });
                }
            }
            //Liberar os barcos de todos os reinos de todas as ações 
            Reino.update({
                barcos_ocupados: 0,
            }, {
                where: { nome_reino: { [Op.not]: null } }
            });

            //Dando a grana das coletas passivas se a rodada X passou
            // if (rodadaatual[0].rodada_atual >= 4) {
            //     for (let i = 0; i < todos_reinos.length; i++) {
            //         let todosterritorios = await Territorio.findAll({ order: [['rei', 'DESC']], attributes: ['rei'], where: { rei: `${todos_reinos[i].rei}` }, raw: true });
            //         let ouroganho = func.ourocoletado(todos_reinos.length, todosterritorios.length)

            //         Reino.increment('ouro', { by: ouroganho, where: { rei: `${todos_reinos[i].rei}` } });
            //     }
            // }
            //Evento de ataque dos barbaros em um território adjacente aleatorio

            //Criando as Cotações da rodada seguinte

            for (let i = 0; i < todos_reinos.length; i++) {

                var pesos = func.gerarCotacoesRecursos(10, 5, 5)
                var recursos = ['ferro', 'madeira', 'tecido', 'oleo', 'trigo']
                var qtdRecursos = recursos.length
                var obj = {}

                for (let i = 0; i < qtdRecursos; i++) {

                    var recurso = recursos[Math.floor(Math.random() * recursos.length)];
                    var recursos = recursos.filter(function (value, index, arr) { return value !== recurso; });

                    var peso = pesos[Math.floor(Math.random() * pesos.length)];
                    var index = pesos.indexOf(peso)
                    if (index > -1) {
                        pesos.splice(index, 1)
                    }
                    obj[recurso] = peso
                }
                obj.rei = todos_reinos[i].rei
                obj.reino = todos_reinos[i].nome_reino
                obj.rodada = rodadaatual[0].rodada_atual + 2
                const test = await Cotacao.create(obj)
                console.log(test);
            }
            var novarodada = parseInt(rodadaatual[0].rodada_atual) + 1;
            Rodada.update({
                rodada_atual: novarodada,
            }, {
                where: { id_rodada: 1 }
            });

            return message.channel.send(`Rodada encerrada, utilize os comandos !cenario e !relatorio para maiores informações`);
        }
    }
}