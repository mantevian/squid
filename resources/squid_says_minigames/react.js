//example of a simple minigame
const { MessageEmbed } = require('discord.js')
module.exports = {
    start_message: 'react to this message!',
    default_time: 20000,
    name: 'react',
    run: async function (channel, players, time, client, info) {
        let all_reactions = info.start_message.awaitReactions(() => true, {
            time: time
        })
        await sleep(time - 1000);
        let alright_times_up_embed = new MessageEmbed()
            .setTitle(`Alright time's up!`)
            .setColor(`#0F93FF`);

        let squid_says_times_up_embed = new MessageEmbed()
            .setTitle(`Squid says time's up!`)
            .setColor(`#0F93FF`);
        if (info.config.opposite_day) await channel.send(alright_times_up_embed)
        else await channel.send(squid_says_times_up_embed)
        await sleep(1000)
        all_reactions = await all_reactions;
        all_reactions = all_reactions.array();

        let all_users = []
        for (let reaction of all_reactions) {
            let users = await reaction.fetchUsers()
            all_users = all_users.concat(users.array())
        }

        let out = [];
        let out_index = [];
        players.forEach((player, i) => {
            let reacted = false;

            if (all_users.includes(player)) {
                if (!info.simon_said) {
                    out.push(player)
                    out_index.push(i)
                } else {
                    reacted = true
                }
            }

            if (info.simon_said && !reacted) {
                out.push(player)
                out_index.push(i)
            }
        })
        let new_players = players.filter((el) => !out.includes(el))
        return ({
            players_out: out,
            players_left: new_players,
            config_out: info.config
        });
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}