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
        var config = utils.args_parse(message.content);

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

                        require(`../utils/save_guild_scoreboards.js`)(client);
                        break;

                    case `update`:
                    case `u`:
                        if (!(await database.get_guild_config_value(message.guild.id, `scoreboard/${config.stat_name}/display_name`)).val()) {
                            message.reply(`That scoreboard stat doesn't exist in this server!`);
                            return;
                        }
                        database.set_guild_config_value(message.guild.id, `scoreboard/${config.stat_name}/display_name`, config.display_name);
                        message.reply(`Updated the scoreboard stat \`${config.stat_name}\`: **${config.display_name}**!`);

                        require(`../utils/save_guild_scoreboards.js`)(client);
                        break;

                    case `remove`:
                    case `r`:
                    case `delete`:
                    case `d`:
                        if (!(await database.get_guild_config_value(message.guild.id, `scoreboard/${config.stat_name}/display_name`)).val()) {
                            message.reply(`That scoreboard stat doesn't exist in this server!`);
                            return;
                        }

                        var stats_length = (await database.get_guild_config_value(message.guild.id, `stats_length`)).val();
                        let ref = database.db.ref(`/guild_stats/${message.guild.id}`).orderByChild(config.stat_name);
                        var n = 0;
                        ref.on(`child_added`, async function (snapshot) {
                            var id = snapshot.key;
                            database.set_user_value(message.guild.id, id, config.stat_name, null);
                            n++;
                            if (n == stats_length)
                                ref.off();
                        });

                        database.set_guild_config_value(message.guild.id, `scoreboard/${config.stat_name}`, null);
                        message.reply(`Removed the scoreboard stat \`${config.stat_name}\`.`);

                        require(`../utils/save_guild_scoreboards.js`)(client);
                        break;

                    default:
                        break;
                }

                break;

            case `members`:
                switch (args[1]) {
                    case `add`:
                    case `a`:
                        var config_array = Object.entries(config);
                        for (var i = 0; i < config_array.length; i++) {
                            if (config_array[i][0] == `user_id`)
                                continue;

                            var stat_on_server = (await database.get_guild_config_value(message.guild.id, `scoreboard/${config_array[i][0]}`)).val();
                            if (!stat_on_server) {
                                message.reply(`This server doesn't have the stat \`${config_array[i][0]}\`.`);
                                return;
                            }

                            var stat = (await database.get_user_value(message.guild.id, config.user_id, config_array[i][0])).val();
                            if (!stat) {
                                message.reply(`This user doesn't have the stat \`${config_array[i][0]}\` set to anything.`);
                                return;
                            }
                            stat += parseInt(config_array[i][1]);
                            database.set_user_value(message.guild.id, config.user_id, config_array[i][0], stat);
                        }
                        var user = message.guild.members.cache.find(m => m.user.id == config.user_id).user.username;
                        if (!user)
                            user = config.user_id;
                        message.reply(`Updated ${user}'s stats!`);
                        break;

                    case `remove`:
                    case `r`:
                        var config_array = Object.entries(config);
                        for (var i = 0; i < config_array.length; i++) {
                            if (config_array[i][0] == `user_id`)
                                continue;

                            var stat_on_server = (await database.get_guild_config_value(message.guild.id, `scoreboard/${config_array[i][0]}`)).val();
                            if (!stat_on_server) {
                                message.reply(`This server doesn't have the stat \`${config_array[i][0]}\`.`);
                                return;
                            }

                            var stat = (await database.get_user_value(message.guild.id, config.user_id, config_array[i][0])).val();
                            if (!stat) {
                                message.reply(`This user doesn't have the stat \`${config_array[i][0]}\` set to anything.`);
                                return;
                            }
                            stat -= parseInt(config_array[i][1]);
                            database.set_user_value(message.guild.id, config.user_id, config_array[i][0], stat);
                        }
                        var user = message.guild.members.cache.find(m => m.user.id == config.user_id).user.username;
                        if (!user)
                            user = config.user_id;
                        message.reply(`Updated ${user}'s stats!`);
                        break;

                    case `set`:
                    case `s`:
                        var config_array = Object.entries(config);
                        for (var i = 0; i < config_array.length; i++) {
                            if (config_array[i][0] == `user_id`)
                                continue;

                            var stat_on_server = (await database.get_guild_config_value(message.guild.id, `scoreboard/${config_array[i][0]}`)).val();
                            if (!stat_on_server) {
                                message.reply(`This server doesn't have the stat \`${config_array[i][0]}\`.`);
                                return;
                            }

                            database.set_user_value(message.guild.id, config.user_id, config_array[i][0], parseInt(config_array[i][1]));
                        }
                        var user = message.guild.members.cache.find(m => m.user.id == config.user_id).user.username;
                        if (!user)
                            user = config.user_id;
                        message.reply(`Updated ${user}'s stats!`);
                }
                break;

            default:
                break;
        }
    }
}