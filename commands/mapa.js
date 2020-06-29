module.exports = {
    name: 'mapa',
    description: 'Manda o mapa',
    execute(message, args) {

        message.channel.send('Mapa do jogo\n');
        message.channel.send('\n', {files: ["https://trello-attachments.s3.amazonaws.com/5ead98bb90879c112d304d18/5eb2f41abd6e80113f281250/67942c69ca9e4d6b61c3c4c82491d6f8/Screenshot_1.png"]});
    },
};