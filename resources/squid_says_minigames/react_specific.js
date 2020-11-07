const { MessageEmbed } = require(`discord.js`);

module.exports = {
    start_message: 'react to the following message with the emoji in it...',
    default_time: 25000,
    name: 'react_specific',
    run: async function (channel, players, time, client, info) {
        const config = info.config;
        const alternatives = config.tasks.react;

        const emoji = alternatives[get_random_int(alternatives.length)]
        let emoji_embed = new MessageEmbed()
            .setDescription(emoji)
            .setColor(`#0F93FF`);
        const start_message = await channel.send(emoji_embed)

        let all_reactions = start_message.awaitReactions(() => true, {
            time: time
        })
        await sleep(time - 1000)
        let alright_times_up_embed = new MessageEmbed()
            .setTitle(`Alright time's up!`)
            .setColor(`#0F93FF`);

        let squid_says_times_up_embed = new MessageEmbed()
            .setTitle(`Squid says time's up!`)
            .setColor(`#0F93FF`);
        if (config.opposite_day) await channel.send(alright_times_up_embed);
        else await channel.send(squid_says_times_up_embed);
        await sleep(1000);
        all_reactions = await all_reactions;
        all_reactions = all_reactions.array();

        let all_users = []
        for (let reaction of all_reactions) {
            if (reaction.emoji.toString() === emoji) {
                let users = await reaction.users.fetch();
                all_users = all_users.concat(users.array());
            }
        }

        let out = [];
        let out_index = [];
        players.forEach((player, i) => {
            let reacted = false;
            if (all_users.includes(player)) {
                if (!info.simon_said) {
                    out.push(player);
                    out_index.push(i);
                } else {
                    reacted = true;
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