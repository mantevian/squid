const
    database = require(`../utils/firebase_connection.js`),
    { MessageEmbed } = require(`discord.js`),
    utils = require(`../utils/util_functions.js`);

module.exports = {
    name: "config",
    enabled: true,
    permission_level: 2,
    description: "Set or view server's configuration",
    usage: "view <item> OR set <item1=value1> [item2=value2] ...",
    run: async (client, message, args) => {
        switch (args[0]) {
            case `view`:
                database.get_guild_config(message.guild.id).then(function (snapshot) {
                    const entries = Object.entries(snapshot.val());
                    if (args.length == 1) {
                        var list = ``;
                        const embed = new MessageEmbed()
                            .setTitle(`${message.guild.name} configuration list`)
                        entries.forEach((e, i) => {
                            if (e[0] != `level_roles`)
                                list += `**${e[0]}**: ${JSON.stringify(e[1])}\n`;

                            if (i == entries.length - 1) {
                                embed.setDescription(list);
                                message.channel.send(embed);
                                return;
                            }
                        });
                    }
                    else {
                        const item = args[1];
                        message.channel.send(`Raw data for **${item}**: \`\`\`json\n${JSON.stringify(snapshot.val()[item])}\`\`\``);
                    }
                });
                break;

            case `set`:
                var config = Object.entries(utils.args_parse(message.content));
                config.forEach(c => {                        
                    database.set_guild_config_value(message.guild.id, c[0], c[1]);
                    message.reply(`Successfully changed the server's configuration!`);
                });
                break;
            default:
                message.reply(`Command usage: \`view <item> OR set <item1=value1> [item2=value2] ...\``);
        }
    }
}