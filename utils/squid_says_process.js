const random_start = require(`../utils/squid_says_random_start.js`),
    discord = require(`discord.js`),
    config = require(`../config.js`).squid_says;

module.exports.run_game = async function (channel, players_, client) {
    let players = players_;
    let time = 1;
    let random_time = 1;
    let winners;
    let game_is_on = true;
    let rounds = 1;
    let last_game = null;

    while (game_is_on) {
        let games = []
        for (let game of client.minigames) {
            if (game.name == 'opposite_day' && rounds < 4) continue
            games.push(game);
        }

        let current_game = games[get_random_int(games.length)];

        while (current_game == last_game) {
            current_game = games[get_random_int(games.length)];
        }

        let start;
        if (current_game.name == 'opposite_day') {
            start = {
                string: config.opposite_day ? 'Good morning,' : 'Squid says',
                real: true
            }
        } else if (rounds < 3) {
            start = {
                string: 'Squid says',
                real: true
            }
        } else {
            start = random_start(channel.guild.id, config);
        }
        random_time = ((Math.random() * 25) + 80) / 100;
        let actual_time = (time * random_time * current_game.default_time).clamp(5000, 25000);

        let start_embed = new discord.MessageEmbed()
            .setTitle(`Task ${rounds}`)
            .setDescription(`${start.string} ${current_game.start_message.toLowerCase()}`)
            .setFooter(`You have ${Math.floor(actual_time / 1000)} seconds`)
            .setColor(`#0F93FF`);
        const start_message = await channel.send(start_embed);

        let {
            players_out,
            players_left,
            config_out
        } = await current_game.run(channel, players, actual_time, client, {
            simon_said: start.real,
            start_message: start_message,
            config: config
        })
        config = config_out;

        await sleep(1000);
        players_out = [...new Set(players_out)];

        function get_players_still_in() {
            var players_list = players_left.map(user => user.username).join(', ');
            if (players_list.length == 0)
                players_list = `none`;

            return players_list;
        }
        var embed = new discord.MessageEmbed()
        if (players_out.length > 0) {
            embed.setTitle(`${players_out.map(user => user.username).join(', ')} ${players_out.length > 1 ? "are" : "is"} out with ${rounds} points...`)
                .setDescription('Players still in: ' + get_players_still_in() + '\n\nThe next task starts in 15 seconds...')
                .setColor(`#FF230F`);
        } else {
            embed.setTitle('Good job! Nobody fell out!\n\n')
                .setDescription('Players still in: ' + get_players_still_in() + '\n\nThe next task starts in 15 seconds...')
                .setColor(`#33CC14`);
        }

        channel.send(embed);
        await sleep(15000);

        if (players_left.length == 0) {
            winners = players_out;
            game_is_on = false;
            break;
        }
        time *= 0.94;
        players = players_left;
        rounds++;
        last_game = current_game;
    }

    var embed = new discord.MessageEmbed()
        .setTitle('The game has ended!')
        .setDescription(`${winners.join(', ')} won with ${rounds} points! GG!`)
        .setColor('#FFBE11')
    channel.send(embed);
}

function get_random_int(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};