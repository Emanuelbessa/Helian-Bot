function adjacente(xorigem, yorigem, xdestino, ydestino) {
    var teste = parseInt(`${xdestino}${ydestino}`)
    if (xorigem % 2 == 0) {
        var ArrEven = [parseInt(`${xorigem - 1}${yorigem - 1}`), parseInt(`${xorigem - 1}${yorigem}`), parseInt(`${xorigem}${yorigem - 1}`), parseInt(`${xorigem}${yorigem + 1}`), parseInt(`${xorigem + 1}${yorigem - 1}`), parseInt(`${xorigem + 1}${yorigem}`)]

        if (ArrEven.includes(teste)) {
            return true
        }
    } else {
        var ArrOdd = [parseInt(`${xorigem - 1}${yorigem}`), parseInt(`${xorigem - 1}${yorigem + 1}`), parseInt(`${xorigem}${yorigem - 1}`), parseInt(`${xorigem}${yorigem + 1}`), parseInt(`${xorigem + 1}${yorigem}`), parseInt(`${xorigem + 1}${yorigem + 1}`)]

        if (ArrOdd.includes(teste)) {
            return true
        }
    }
    return false
}

function adjacenteStr(xorigem, yorigem) {
    if (xorigem % 2 == 0) {
        var ArrEven = [`${xorigem - 1}${yorigem - 1}`, `${xorigem - 1}${yorigem}`, `${xorigem}${yorigem - 1}`, `${xorigem}${yorigem + 1}`, `${xorigem + 1}${yorigem - 1}`, `${xorigem + 1}${yorigem}`]
        return ArrEven
    } else {
        var ArrOdd = [`${xorigem - 1}${yorigem}`, `${xorigem - 1}${yorigem + 1}`, `${xorigem}${yorigem - 1}`, `${xorigem}${yorigem + 1}`, `${xorigem + 1}${yorigem}`, `${xorigem + 1}${yorigem + 1}`]
        return ArrOdd
    }
}

function ourocoletado(players, territorios) {
    var ouro

    if (players == 4) {
        switch (true) {
            case (territorios <= 3):
                ouro = 7
                break;
            case (territorios <= 6):
                ouro = 5
                break;
            case (territorios >= 7):
                ouro = 3
                break;
            default:
                break
        }
    }

    if (players == 5) {
        switch (true) {
            case (territorios <= 3):
                ouro = 7
                break;
            case (territorios <= 5):
                ouro = 5
                break;
            case (territorios >= 6):
                ouro = 3
                break;
            default:
                break
        }
    }
    return ouro
}

function quantidadeAcoes(qtdTerritorios) {
    switch (true) {
        case qtdTerritorios <= 2:
            return 3
        case qtdTerritorios == 3 || qtdTerritorios == 4:
            return 4
        case qtdTerritorios >= 5 && qtdTerritorios < 8:
            return 5
        case qtdTerritorios >= 8 && qtdTerritorios <= 10:
            return 6
        case qtdTerritorios >= 11:
            return 7
        default:
            break;
    }
}

function adjacente2dist(xorigem, yorigem, xdestino, ydestino) {
    var teste = parseInt(`${xdestino}${ydestino}`)
    if (xorigem % 2 == 0) {
        var ArrEven = [parseInt(`${xorigem - 2}${yorigem - 1}`), parseInt(`${xorigem - 2}${yorigem}`), parseInt(`${xorigem - 2}${yorigem + 1}`), parseInt(`${xorigem - 1}${yorigem - 2}`), parseInt(`${xorigem - 1}${yorigem - 1}`), parseInt(`${xorigem - 1}${yorigem}`), parseInt(`${xorigem - 1}${yorigem + 1}`), parseInt(`${xorigem}${yorigem - 2}`), parseInt(`${xorigem}${yorigem - 1}`), parseInt(`${xorigem}${yorigem + 1}`), parseInt(`${xorigem}${yorigem + 2}`), parseInt(`${xorigem + 1}${yorigem - 2}`), parseInt(`${xorigem + 1}${yorigem - 1}`), parseInt(`${xorigem + 1}${yorigem}`), parseInt(`${xorigem + 1}${yorigem + 1}`), parseInt(`${xorigem + 2}${yorigem - 1}`), parseInt(`${xorigem + 2}${yorigem}`), parseInt(`${xorigem + 2}${yorigem + 1}`)]

        if (ArrEven.includes(teste)) {
            return true
        }
    } else {
        var ArrOdd = [parseInt(`${xorigem - 2}${yorigem - 1}`), parseInt(`${xorigem - 2}${yorigem}`), parseInt(`${xorigem - 2}${yorigem + 1}`), parseInt(`${xorigem - 1}${yorigem - 1}`), parseInt(`${xorigem - 1}${yorigem}`), parseInt(`${xorigem - 1}${yorigem + 1}`), parseInt(`${xorigem - 1}${yorigem + 2}`), parseInt(`${xorigem}${yorigem - 2}`), parseInt(`${xorigem}${yorigem - 1}`), parseInt(`${xorigem}${yorigem + 1}`), parseInt(`${xorigem}${yorigem + 2}`), parseInt(`${xorigem + 1}${yorigem - 1}`), parseInt(`${xorigem + 1}${yorigem}`), parseInt(`${xorigem + 1}${yorigem + 1}`), parseInt(`${xorigem + 1}${yorigem + 2}`), parseInt(`${xorigem + 2}${yorigem - 1}`), parseInt(`${xorigem + 2}${yorigem}`), parseInt(`${xorigem + 2}${yorigem + 1}`)]

        if (ArrOdd.includes(teste)) {
            return true
        }
    }
    return false
}

function territoriosIniciais(arrayPossibilidades, nJogadores) {
    var territorios = []

    var TerrA = arrayPossibilidades[Math.floor(Math.random() * arrayPossibilidades.length)];
    territorios.push(TerrA)
    const index = arrayPossibilidades.indexOf(TerrA)
    if (index > -1) {
        arrayPossibilidades.splice(index, 1)
    }
    var safe = 0
    while ((territorios.length < nJogadores) && (safe < 1000)) {
        var TerrB = arrayPossibilidades[Math.floor(Math.random() * arrayPossibilidades.length)];
        var controle = 0
        safe++
        for (let i = 0; i < territorios.length; i++) {

            if (!(adjacente2dist(parseInt(territorios[i].split('')[0]), parseInt(territorios[i].split('')[1]), parseInt(TerrB.split('')[0]), parseInt(TerrB.split('')[1])))) {
                controle++
            }
            if (controle == territorios.length) {
                territorios.push(TerrB)
                const index = arrayPossibilidades.indexOf(TerrB)
                if (index > -1) {
                    arrayPossibilidades.splice(index, 1)
                }
                break
            }
        }
    }
    return territorios
}

function numerosParaLetras(x, y) {
    switch (x) {
        case 1:
            x = 'a'
            break;
        case 2:
            x = 'b'
            break;
        case 3:
            x = 'c'
            break;
        case 4:
            x = 'd'
            break;
        case 5:
            x = 'e'
            break;
        case 6:
            x = 'f'
            break;
        case 7:
            x = 'g'
            break;
        default:
            break;
    }

    return x + y
}

function randomMinMax(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mar_encontra_caminho(mar_origem, mar_destino, mares_controlados, relacao_adjacencia_mares) {
    var caminhos = [[mar_origem]]
    cont = 0

    for (mar of relacao_adjacencia_mares[mar_origem]) {
        if (mares_controlados.includes(mar)) {
            var lista_vazia = []
            caminhos.push(lista_vazia)
            caminhos[cont].push(mar)
            cont++
        }
    }
    for (let i = 0; i < caminhos.length; i++) {
        for (const mar_caminho of caminhos[i]) {
            for (const mar_adjacente of relacao_adjacencia_mares[mar_caminho]) {
                // console.log('mar adjacente :', mar_adjacente);
                if (!caminhos[i].includes(mar_adjacente) && mares_controlados.includes(mar_adjacente) && !caminhos[i].includes(mar_destino)) {
                    caminhos[i].push(mar_adjacente)
                    //console.log(caminhos)
                }
            }
        }
    }
    encontrou_caminho = false
    for (const caminho of caminhos) {
        if (caminho.includes(mar_destino)) {
            encontrou_caminho = true
        }
    }
    return encontrou_caminho
}

function mar_encontra_adjacente(mar_origem, mar_destino, mares_controlados, relacao_adjacencia_mares) {
    var caminhos = [[mar_origem]]
    cont = 0

    for (mar of relacao_adjacencia_mares[mar_origem]) {
        if (mares_controlados.includes(mar)) {
            var lista_vazia = []
            caminhos.push(lista_vazia)
            caminhos[cont].push(mar)
            cont++
        }
    }
    var mares_possiveis = []
    for (let i = 0; i < caminhos.length; i++) {
        for (const mar_caminho of caminhos[i]) {
            for (const mar_adjacente of relacao_adjacencia_mares[mar_caminho]) {
                //console.log('mar adjacente :', mar_adjacente);
                if (!mares_possiveis.includes(mar_adjacente)) {
                    mares_possiveis.push(mar_adjacente)
                }
            }
        }
    }

    encontrou_caminho = false
    if (mares_possiveis.includes(mar_destino)) {
        encontrou_caminho = true
    }
    return encontrou_caminho
}

function isValid(str) {
    return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

function gerarCotacoesRecursos(peso, qtdRecursos, valorMaxUnico) {
    var r = [];
    var currsum = 0;
    for (var i = 0; i < qtdRecursos - 1; i++) {
        r[i] = randomMinMax(1, peso - (qtdRecursos - i - 1) - currsum);
        while (r[i] > valorMaxUnico) {
            r[i] = randomMinMax(1, peso - (qtdRecursos - i - 1) - currsum);
        }
        currsum += r[i];
    }
    r[qtdRecursos - 1] = peso - currsum;
    if (r[qtdRecursos - 1] >= valorMaxUnico) {
        return gerarCotacoesRecursos(peso, qtdRecursos, valorMaxUnico);
    }
    return r;
}

module.exports.ourocoletado = ourocoletado;
module.exports.quantidadeAcoes = quantidadeAcoes;
module.exports.adjacente = adjacente;
module.exports.adjacenteStr = adjacenteStr;
module.exports.adjacente2dist = adjacente2dist;
module.exports.territoriosIniciais = territoriosIniciais;
module.exports.numerosParaLetras = numerosParaLetras;
module.exports.randomMinMax = randomMinMax;
module.exports.mar_encontra_caminho = mar_encontra_caminho;
module.exports.mar_encontra_adjacente = mar_encontra_adjacente;
module.exports.isValid = isValid;
module.exports.gerarCotacoesRecursos = gerarCotacoesRecursos;