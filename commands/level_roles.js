const
    database = require(`../utils/firebase_connection.js`);

module.exports = {
    name: "level_roles",
    enabled: true,
    permission_level: 2,
    beta: false,
    description: "Set or view server's level roles. Use `remove` in <role name> to remove a role from the list",
    usage: "set <level> <role name> OR view",
    run: async (client, message, args) => {
        switch (args[0]) {
            case `set`:
                var level = args[1];
                var name = args.slice(2).join(' ');

                if (name == `remove`) {
                    database.set_guild_config_value(message.guild.id, `level_roles/level_${level}`, null);
                    message.reply(`Removed a level role for level ${level}.`);
                    return;
                }

                const role = message.guild.roles.cache.find(r => r.name.toLowerCase().includes(name.toLowerCase()));

                database.set_guild_config_value(message.guild.id, `level_roles/level_${level}`, {
                    level: parseInt(level),
                    role_id: role.id
                });

                message.reply(`Changed **${level}**'s level role to **${role.name}**!`);
                break;
            case `view`:
                var list = ``;
                var i = 0;
                database.db.ref(`/guild_config/${message.guild.id}/level_roles`).once(`value`)
                    .then(function (snapshot) {
                        if (!snapshot.val()) {
                            message.reply(`Level roles aren't configured in this server yet.`);
                            return;
                        }
                        arr_length = Object.entries(snapshot.val()).length;
                    })
                    .then(function () {
                        database.db.ref(`/guild_config/${message.guild.id}/level_roles`).orderByChild(`level`).on(`child_added`, function (snapshot) {
                            const name = message.guild.roles.cache.find(r => r.id == snapshot.val().role_id);
                            list += `**${snapshot.val().level}**: ${name}\n`;
                            if (i == arr_length - 1) {
                                const embed = new MessageEmbed()
                                    .setTitle(`${message.guild.name} level role list`)
                                    .setDescription(list);
                                message.channel.send(embed);
                            }
                            i++;
                        });
                    });
                break;
        }
    }
}