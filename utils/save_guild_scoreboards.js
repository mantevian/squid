const
    database = require(`./firebase_connection`);

module.exports = function (client) {
    client.guilds.cache.forEach(async (g) => {
        var guild_scoreboard = (await database.get_guild_config_value(g.id, `scoreboard`)).val();
        if (guild_scoreboard) {
            client.scoreboards.set(g.id, guild_scoreboard);
        }
        else
            client.scoreboards.set(g.id, undefined);
    });
}