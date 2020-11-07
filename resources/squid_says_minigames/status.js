const { MessageEmbed } = require('discord.js');

module.exports = {
    start_message: 'change your status to:',
    default_time: 25000,
    name: 'status',
    run: async function (channel, players, time, client, info) {
        const config = info.config
        const alternatives = config.tasks.status

        const status = alternatives[get_random_int(alternatives.length)]

        let status_embed = new MessageEmbed()
            .setTitle(`${status.replace('dnd', 'do not disturb').replace('offline', 'invisible')}`)
            .setColor(`#0F93FF`)
        await channel.send(status_embed);

        await sleep(time);

        let alright_times_up_embed = new MessageEmbed()
            .setTitle(`Alright time's up!`)
            .setColor(`#0F93FF`);

        let squid_says_times_up_embed = new MessageEmbed()
            .setTitle(`Squid says time's up!`)
            .setColor(`#0F93FF`);
        if (config.opposite_day) await channel.send(alright_times_up_embed)
        else await channel.send(squid_says_times_up_embed);

        let out = []
        let out_index = []
        players.forEach((player, i) => {

            if (player.presence.status == status) {
                if (!info.simon_said) {
                    out.push(player)
                    out_index.push(i)
                }
            } else {
                if (info.simon_said) {
                    out.push(player)
                    out_index.push(i)
                }
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

function get_random_int(max) {
    return Math.floor(Math.random() * Math.floor(max));
}