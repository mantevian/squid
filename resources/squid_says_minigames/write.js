var fs = require('fs')
const { MessageEmbed } = require('discord.js')

module.exports = {
    start_message: 'write something in chat!',
    default_time: 12500,
    name: 'write',
    run: async function (channel, players, time, client, info) {
        const collector = channel.createMessageCollector(() => true);
        const config = info.config;

        let collected
        collector.on('end', collected_ => {
            collected = collected_
        });

        await sleep(time);
        let alright_times_up_embed = new MessageEmbed()
            .setTitle(`Alright time's up!`)
            .setColor(`#0F93FF`)

        let squid_says_times_up_embed = new MessageEmbed()
            .setTitle(`Squid says time's up!`)
            .setColor(`#0F93FF`)
        if (config.opposite_day) await channel.send(alright_times_up_embed)
        else await channel.send(squid_says_times_up_embed)
        collector.stop()

        let messages = collected.array();
        let out = [];
        let out_index = [];
        players.forEach((player, i) => {
            let sent_message = false
            for (const message of messages) {
                if (message.author == player) {
                    if (!info.simon_said) {
                        out.push(player);
                        out_index.push(i);
                    } else {
                        sent_message = true;
                    }
                    break;
                }
            }
            if (info.simon_said && !sent_message) {
                out.push(player);
                out_index.push(i);
            }
        })
        let new_players = players.filter((el) => !out.includes(el))
        return ({
            players_out: out,
            players_left: new_players,
            config_out: config
        })
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}