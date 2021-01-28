const
    database = require(`./firebase_connection`),
    utils = require(`./util_functions`),
    { randomInt } = require(`mathjs`);

module.exports = {
    run: async (message, client) => {
        const all_settings = client.guild_settings.array();

        for (var g = 0; g < all_settings.length; g++) {
            if (!all_settings[g])
                continue;

            const guild_settings = Object.entries(all_settings[g]);

            if (!guild_settings) {
                database.create_guild(message.guild.id);
                return;
            }

            if (!guild_settings.xp_enabled)
                return;

            const user_data = (await database.get_user_data(message.guild.id, message.author.id)).val();

            if (!user_data) {
                database.create_user(message.guild.id, message.author.id);
                database.increment_stats_length(message.guild.id);
                return;
            }

            const now = Date.now();
            const last_date = user_data.last_xp_message_timestamp;

            if (now - last_date < guild_settings.xp_cooldown)
                return;

            database.set_user_value(message.guild.id, message.author.id, `last_xp_message_timestamp`, now);

            var old_level = user_data.level;

            var xp = user_data.xp;
            xp += randomInt(guild_settings.xp_min, guild_settings.xp_max);

            var new_level = 0;
            var level_xp = 100;
            while (xp >= level_xp) {
                new_level++;
                if (guild_settings.old_leveling == true)
                    level_xp += new_level * new_level + 50 * new_level + 100;
                else
                    level_xp += Math.floor(new_level * (new_level * new_level + 20 * new_level + 800) / 35.49165) + 131;
            }

            database.set_rank(message.guild.id, message.author.id, xp, new_level);

            if (new_level <= old_level)
                return;

            const levelup_message_adjectives = (await database.get_guild_config_value(message.guild.id, `levelup_message_adjectives`)).val();
            const levelup_emoji = (await database.get_guild_config_value(message.guild.id, `levelup_emoji`)).val();

            const levelup_adjective = utils.weighted_random_choice(levelup_message_adjectives);

            message.channel.send(`The ${levelup_adjective} **${message.author.username}** has just leveled up to level **${new_level}**! ${levelup_emoji}`);

            var level_roles = (await database.get_guild_config_value(message.guild.id, `level_roles`));
            if (!level_roles)
                return;
            level_roles = level_roles.val();

            if (!level_roles[`level_${new_level}`])
                return;

            const new_level_role_id = level_roles[`level_${new_level}`].role_id;

            if (!new_level_role_id)
                return;

            if (!message.guild.roles.cache.find(r => r.id == new_level_role_id))
                return;

            for (var i = 0; i < new_level; i++) {
                if (!level_roles[`level_${i}`])
                    continue;

                if (utils.has_role(message.guild, message.member, level_roles[`level_${i}`].role_id))
                    message.member.roles.remove(utils.find_role(message.guild, level_roles[`level_${i}`].role_id));
            }

            const new_level_role = message.guild.roles.cache.find(r => r.id == new_level_role_id);
            message.member.roles.add(new_level_role);

            if (guild_settings.new_role_message_enabled) {
                const new_role_emoji = (await database.get_guild_config_value(message.guild.id, `new_role_emoji`)).val();
                message.channel.send(`**${message.author.username}** has recieved a new rank: **${new_level_role.name}**! ${new_role_emoji}`);
            }
        }
    }
}