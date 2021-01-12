const
    { MessageEmbed } = require(`discord.js`),
    database = require(`../utils/firebase_connection.js`),
    utils = require(`../utils/util_functions.js`);

module.exports = {
    name: "trigger",
    enabled: true,
    permission_level: 2,
    description: "Manage message triggers for a server",
    usage: "create <trigger name> <type> <channel id> OR remove <trigger name> OR add_requirement <trigger name> <args> OR add_action <trigger name> <args>",
    run: async (client, message, args) => {
        if (args.length == 0) {
            message.reply(`Usage: \`create <trigger name> <type> <channel id> OR remove <trigger name> OR add_requirement <trigger name> <args> OR add_action <trigger name> <args>\`. Learn more: https://github.com/mantevian/squid#config`);
            return;
        }

        switch (args[0]) {
            case `create`:
                if (args.length != 4) {
                    message.reply(`Usage: \`s/trigger create <trigger name> <type> <channel id>\``)
                }

                switch (args[2]) {
                    case `sent`:
                    case `edited`:
                    case `deleted`:
                        break;

                    default:
                        message.reply(`Trigger type can only be \`sent\`, \`edited\` or \`deleted\`.`);
                        return;
                }

                database.db.ref(`guild_config/${message.guild.id}/message_triggers/`).once(`value`).then(function (snapshot) {
                    if (!snapshot)
                        message.reply(`Something went wrong...`);
                    else {
                        var channel = message.guild.channels.cache.find(c => c.id == args[3]);
                        if (args[3] != `-1` && !channel) {
                            message.reply(`There is no such channel in this server!`);
                            return;
                        }
                        database.db.ref(`guild_config/${message.guild.id}/message_triggers/${args[1]}`).set({
                            enabled: true,
                            channel_id: args[3],
                            type: args[2]
                        });
                        if (args[3] == `-1`)
                            message.reply(`Successfully saved a new message trigger: \`${args[1]}\`!`);
                        else
                            message.reply(`Successfully saved a new message trigger: \`[${args[2]}] ${args[1]}\` in <#${args[3]}>!`);
                        require(`../utils/save_triggers.js`)(client);
                    }
                });
                break;

            case `remove`:
                database.db.ref(`guild_config/${message.guild.id}/message_triggers/`).once(`value`).then(function (snapshot) {
                    if (!snapshot)
                        message.reply(`The trigger \`${args[1]}\` does not exist in this server.`);
                    else {
                        database.db.ref(`guild_config/${message.guild.id}/message_triggers/${args[1]}`).set(null);
                        message.reply(`Successfully removed the message trigger \`${args[1]}\`.`);
                        require(`../utils/save_triggers.js`)(client);
                    }
                });
                break;

            case `add_requirement`:
                database.db.ref(`guild_config/${message.guild.id}/message_triggers/${args[1]}`).once(`value`).then(function (snapshot) {
                    if (!snapshot)
                        message.reply(`The trigger \`${args[1]}\` does not exist in this server.`);
                    else {
                        var config = utils.args_parse(message.content);
                        database.db.ref(`guild_config/${message.guild.id}/message_triggers/${args[1]}/requirements/${args[2]}`).set(config);
                        message.reply(`Successfully saved a new message trigger requirement \`[${args[2]}] ${config.requirement}\` for \`${args[1]}\`!`);
                        require(`../utils/save_triggers.js`)(client);
                    }
                });
                break;

            case `add_action`:
                database.db.ref(`guild_config/${message.guild.id}/message_triggers/${args[1]}`).once(`value`).then(function (snapshot) {
                    if (!snapshot)
                        message.reply(`The trigger \`${args[1]}\` does not exist in this server.`);
                    else {
                        var config = utils.args_parse(message.content);
                        database.db.ref(`guild_config/${message.guild.id}/message_triggers/${args[1]}/actions/${args[2]}`).set(config);
                        message.reply(`Successfully saved a new message trigger action \`[${args[2]}] ${config.action}\` for \`${args[1]}\`!`);
                        require(`../utils/save_triggers.js`)(client);
                    }
                });
                break;

            case `update`:
                database.db.ref(`guild_config/${message.guild.id}/message_triggers/${args[1]}`).once(`value`).then(function (snapshot) {
                    if (!snapshot)
                        message.reply(`The trigger \`${args[1]}\` does not exist in this server.`);
                    else {
                        var config = Object.entries(utils.args_parse(message.content));
                        for (var i = 0; i < config.length; i++)
                            database.db.ref(`guild_config/${message.guild.id}/message_triggers/${args[1]}/${config[i][0]}`).set(config[i][1]);
                        message.reply(`Successfully updated the message trigger \`${args[1]}\`!`);
                        require(`../utils/save_triggers.js`)(client);
                    }
                });
                break;

            case `view`:
                database.get_guild_config_value(message.guild.id, `message_triggers`).then(function (snapshot) {
                    if (!snapshot) {
                        message.reply(`There are no triggers in this server. Use \`s!trigger create\` to add one.`);
                        return;
                    }
                    const entries = Object.entries(snapshot.val());
                    if (args.length == 1) {
                        var list = ``;
                        const embed = new MessageEmbed()
                            .setTitle(`${message.guild.name} trigger list`)
                        entries.forEach((e, i) => {
                            list += `**${e[0]}**: in channel <#${e[1].channel_id}>, checks for \`${e[1].requirements[0].requirement}\` +${Object.entries(e[1].requirements).length - 1}, does \`${e[1].actions[0].action}\` +${Object.entries(e[1].action).length - 1}\n`;

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
        }
    }
}