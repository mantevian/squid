const
    database = require(`../utils/firebase_connection.js`),
    utils = require(`../utils/util_functions.js`);

module.exports = {
    name: "scoreboard",
    enabled: true,
    permission_level: 3,
    beta: true,
    description: "Control the server's stats",
    usage: "stats create|update|remove [stat_name, display_name] OR members add|remove|set [user_id, stat_name=amount ...]",
    run: async (client, message, args) => {
        var config = utils.args_parse(args);

        switch (args[0]) {
            case `stats`:
                switch (args[1]) {
                    case `create`:
                    case `c`:
                    case `add`:
                    case `a`:
                        if (!config.display_name)
                            config.display_name = config.stat_name;

                        database.set_guild_config_value(message.guild.id, `scoreboard/${config.stat_name}/display_name`, config.display_name);
                        message.reply(`Added a new scoreboard stat \`${config.stat_name}\`: **${config.display_name}**!`);
                        break;

                    case `update`:
                    case `u`:
                        if (!(await database.get_guild_config_value(message.guild.id, `scoreboard/${config.stat_name}/display_name`)).val()) {
                            message.reply(`That scoreboard stat doesn't exist yet!`);
                            return;
                        }
                        database.set_guild_config_value(message.guild.id, `scoreboard/${config.stat_name}/display_name`, config.display_name);
                        message.reply(`Updated the scoreboard stat \`${config.stat_name}\`: **${config.display_name}**!`);
                        break;

                    case `remove`:
                    case `r`:
                    case `delete`:
                    case `d`:
                        if (!(await database.get_guild_config_value(message.guild.id, `scoreboard/${config.stat_name}/display_name`)).val()) {
                            message.reply(`That scoreboard stat doesn't exist yet!`);
                            return;
                        }
                        database.set_guild_config_value(message.guild.id, `scoreboard/${config.stat_name}`, null);
                        message.reply(`Removed the scoreboard stat \`${config.stat_name}\`.`);
                        break;

                    default:
                        break;
                }

                break;

            case `members`:
                switch (args[1]) {
                    case `add`:
                    case `a`:
                        var stat = (await database.get_user_value(message.guild.id, config.user_id, config.stat_name)).val();
                        if (!stat) {
                            message.reply(`Nothing found.`);
                            return;
                        }
                        stat += parseInt(config.amount);
                        database.set_user_value(message.guild.id, config.user_id, config.stat_name, stat);
                        var user = message.guild.members.cache.find(m => m.user.id == config.user_id).username;
                        if (!user)
                            user = config.user_id;
                        message.reply(`Changed ${user}'s ${stat_name} to ${stat}!`);
                        break;

                    case `remove`:
                    case `r`:
                        var stat = (await database.get_user_value(message.guild.id, config.user_id, config.stat_name)).val();
                        if (!stat) {
                            message.reply(`Nothing found.`);
                            return;
                        }
                        stat -= parseInt(config.amount);
                        database.set_user_value(message.guild.id, config.user_id, config.stat_name, stat);
                        var user = message.guild.members.cache.find(m => m.user.id == config.user_id).username;
                        if (!user)
                            user = config.user_id;
                        message.reply(`Changed ${user}'s ${stat_name} to ${stat}!`);
                        break;

                    case `set`:
                    case `s`:
                        var stat = (await database.get_user_value(message.guild.id, config.user_id, config.stat_name)).val();
                        if (!stat) {
                            message.reply(`Nothing found.`);
                            return;
                        }
                        stat = parseInt(config.amount);
                        database.set_user_value(message.guild.id, config.user_id, config.stat_name, stat);
                        var user = message.guild.members.cache.find(m => m.user.id == config.user_id).username;
                        if (!user)
                            user = config.user_id;
                        message.reply(`Changed ${user}'s ${stat_name} to ${stat}!`);
                        break;
                }
                break;

            default:
                break;
        }
    }
}