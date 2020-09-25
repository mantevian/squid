const
    database = require(`../utils/firebase_connection.js`);

module.exports = {
    name: "set_rank",
    enabled: true,
    permission_level: 3,
    description: "Change one's XP",
    usage: "<user ID> <xp>",
    run: async (client, message, args) => {
        var id = args[0];
        var xp = parseInt(args[1]);

        database.get_user_value(message.guild.id, id, `xp`).then(function (snapshot) {
            if (!snapshot)
                message.reply(`Can't find that user.`);
            else {
                database.set_squid_xp(message.guild.id, id, xp);
                let name = id;

                if (message.guild.members.cache.find(m => m.id == id))
                    name = message.guild.members.cache.find(m => m.id == id).user.username;
                    
                message.reply(`Changed **${name}**'s XP to **${xp}**!`);
            }
        });
    }
}