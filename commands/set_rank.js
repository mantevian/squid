const
    database = require(`../../utils/firebase_connection.js`);

module.exports = {
    name: "set_rank",
    enabled: true,
    permission_level: 3,
    description: "Change one's XP",
    usage: "<user ID> <xp>",
    run: async (client, message, args) => {
        var id = args[0];
        var xp = parseInt(args[1]);

        database.get_user_data(message.guild.id, id).then(function (snapshot) {
            if (!snapshot)
                message.reply(`Can't find that user.`);
            else {
                database.set_squid_rank(message.guild.id, id, xp);
                const name = message.guild.members.cache.find(m => m.id == id).user.username;
                message.reply(`Changed **${name}**'s XP to **${xp}**!`);
            }
        })
        
    }
}