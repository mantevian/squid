const
    database = require(`./firebase_connection`);

module.exports = function (client) {
    client.guilds.cache.forEach(async (g) => {
        var guild_settings = (await database.get_guild_config_value(g.id, `settings`)).val();
        if (guild_settings)
            client.guild_settings.set(g.id, guild_settings);
        else
            client.guild_settings.set(g.id, undefined);
    });
}