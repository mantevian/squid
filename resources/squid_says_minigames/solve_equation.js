const { MessageEmbed } = require(`discord.js`);

module.exports = {
    start_message: 'write the correct answer to the following equation...',
    default_time: 25000,
    name: 'solve_equation',
    run: async function (channel, players, time, client, info) {
        const symbols = ['+', '-', '*']; // ×
        const symbol = symbols[get_random_int(symbols.length)];
        const equation = `${get_random_int(symbol == '*' ? 10 : 20)} ${symbol} ${get_random_int(symbol == '*' ? 10 : 20)}`;
        let text_embed = new MessageEmbed()
            .setTitle(`**${equation.toUpperCase().replace('*', '×')}**`)
            .setColor(`#0F93FF`);
        await channel.send(text_embed);
        const answer = eval(equation);

        const collector = channel.createMessageCollector(() => true);

        const config = info.config;

        let collected
        collector.on('end', collected_ => {
            collected = collected_
        });

        await sleep(time);

        let alright_times_up_embed = new MessageEmbed()
            .setTitle(`Alright time's up!`)
            .setColor(`#0F93FF`);

        let squid_says_times_up_embed = new MessageEmbed()
            .setTitle(`Squid says time's up!`)
            .setColor(`#0F93FF`);
        if (config.opposite_day) await channel.send(alright_times_up_embed);
        else await channel.send(squid_says_times_up_embed);
        collector.stop();

        let messages = collected.array()
        let out = [];
        let out_index = [];
        players.forEach((player, i) => {
            let sent_correct_message = false;
            for (const message of messages) {
                if (message.author == player && parseInt(message.content.toLowerCase()) == answer) {
                    if (!info.simon_said) {
                        out.push(player);
                        out_index.push(i);
                    } else {
                        sent_correct_message = true;
                    }
                    break;
                }
            }
            if (info.simon_said && !sent_correct_message) {
                out.push(player);
                out_index.push(i);
            }
        });
        let new_players = players.filter((el) => !out.includes(el));
        let draw = false;
        if (new_players.length == 0 && players.length > 1) {
            draw = true;
            new_players = players;
        }
        
        return ({
            players_out: out,
            players_left: new_players,
            config_out: info.config,
            draw: draw
        });
    }
}

function get_random_int(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}