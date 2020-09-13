const
    database = require(`./firebase_connection`);

module.exports = function (client) {
    client.guilds.cache.forEach(async (g) => {
        var guild_triggers = (await database.get_guild_config_value(g.id, `message_triggers`)).val();
        if (guild_triggers) {
            client.message_triggers.set(g.id, guild_triggers);
        }
    });
}