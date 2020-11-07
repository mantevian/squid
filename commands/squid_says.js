const { MessageEmbed } = require(`discord.js`);

module.exports = {
    name: "squid_says",
    enabled: true,
    permission_level: 2,
    beta: true,
    description: "The Simon Says game",
    usage: "start <channel> <time to join in seconds>",
    run: async (client, message, args) => {
        var config = require(`../config.js`).squid_says;
        config.opposite_day = false;

        if (args.length < 2) {
            message.reply(`Include a channel! (\`${args[1]} #<channel name>\`)`);
            return;
        }

        let channel = client.channels.cache.get(args[1].slice(2).slice(0, -1));

        if (!channel) {
            message.reply(`That's not a valid channel!`);
            return;
        }
        let time = args[2] ? parseInt(args[2]) * 1000 : 60000;
        if (!time) {
            message.reply(`The time must be an integer of seconds.`);
            return;
        }

        if (channel) {
            message.channel.send(`Starting game in ${channel}!`);
        } else {
            message.reply(`${args[1]} is not a valid channel`);
            return;
        }

        let start_embed = new MessageEmbed().setTitle(`REACT TO THIS MESSAGE TO JOIN SQUID SAYS!`)
            .setDescription(`Hosted by <@${message.author.id}>`)
            .setColor(message.member.displayColor)
            .setFooter(`The game will start in ${Math.floor(time / 1000)} seconds.`);
        channel.send(start_embed).then(async (msg) => {
            msg.react(`🎲`);

            let collected = await msg.awaitReactions(() => true, {
                time: time
            });

            let players = [];
            for (let reaction of collected.array()) {
                let users = await reaction.fetchUsers();
                players = players.concat(users.array());
            }
            players = players.filter(player => player.id != client.user.id);

            channel.send(`The game is starting! Players: ${players.join(', ')}`);
            let explanation_embed = new MessageEmbed().setTitle('**Only follow my commands if they start with "Squid says" and look out for typos!\nIf you fail, you are out of the game!**')
                .setColor('#0F93FF');
            channel.send(explanation_embed);
            if (time > 30000 || players.length > 5) {
                await sleep(10000);
            } else {
                await sleep(5000);
            }

            run_game(channel, players, client);
            msg.delete();
        });
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}