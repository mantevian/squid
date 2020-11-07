const { MessageEmbed } = require('discord.js')

module.exports = {
    start_message: 'it\'s a new day!',
    default_time: 20000,
    name: 'opposite_day',
    run: async function (channel, players, time, client, info) {
        var config = info.config;

        let opposite_day_begins_embed = new MessageEmbed()
            .setTitle(`Opposite day begins soon! Squid says write **ok** in chat if you are ready!`)
            .setColor(`#0F93FF`);

        let opposite_day_has_ended_embed = new MessageEmbed()
            .setTitle(`Opposite day has ended! Write **ok** if you are ready to go back to normal!`)
            .setColor(`#0F93FF`);

        if (!config.opposite_day) await channel.send(opposite_day_begins_embed)
        else await channel.send(opposite_day_has_ended_embed);

        const collector = channel.createMessageCollector(() => true);

        let collected
        collector.on('end', collected_ => {
            collected = collected_
        });

        await sleep(time);

        let squid_says_times_up_embed = new MessageEmbed()
            .setTitle(`Squid says time\'s up! We\'re ready to start the opposite day!\n**From now and until opposite day ends, do the opposite of what you would normally do to stay in the game!**`)
            .setColor(`#0F93FF`);

        let alright_times_up_embed = new MessageEmbed()
            .setTitle(`Alright time\'s up! We\'ve ended the opposite day!`)
            .setColor(`#0F93FF`);

        if (!config.opposite_day) await channel.send(squid_says_times_up_embed)
        else await channel.send(alright_times_up_embed);

        collector.stop();
        await sleep(6000);
        let messages = collected.array();
        let out = [];
        let out_index = [];
        players.forEach((player, i) => {
            let sent_correct_message = false
            for (const message of messages) {
                if (message.author == player && message.content.toLowerCase().includes("ok")) {
                    sent_correct_message = true;
                    break;
                }
            }
            if (!sent_correct_message) {
                out.push(player);
                out_index.push(i);
            }
        });
        let new_players = players.filter((el) => !out.includes(el));

        config.opposite_day = !config.opposite_day;

        return ({
            players_out: out,
            players_left: new_players,
            config_out: config
        });
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}