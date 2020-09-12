const
    Discord = require(`discord.js`),
    fs = require(`fs`),
    config = require(`./config.js`),
    database = require(`./utils/firebase_connection.js`);

const squid = new Discord.Client();
squid.prefix = "s/";
squid.name = "squid";

squid.commands = new Discord.Collection();
squid.message_triggers = new Discord.Collection();

require(`./utils/command_handler.js`)(squid);

squid.on(`ready`, () => {
    squid.user.setActivity(`Mante`, { type: `LISTENING` });
    console.log(`squiddley`);

    squid.guilds.cache.forEach(async (g) => {
        var guild_triggers = (await database.get_guild_config_value(g.id, `message_triggers`)).val();
        if (guild_triggers) {
            squid.message_triggers.set(g.id, guild_triggers);
        }
    });
});

squid.on(`message`, message => {
    let message_events = fs.readdirSync(`./utils/message_events/`).filter(f => f.endsWith(`.js`));

    for (let file of message_events) {
        let script = require(`./utils/message_events/${file}`);
        script.run(message, squid);
    }

    if (message.author.bot || !message.guild || !(message.content.startsWith(squid.prefix) || message.content.startsWith(`s!`)))
        return;

    let args = message.content.slice(squid.prefix.length).trim().split(/ +/g);
    let message_command = args.shift().toLowerCase();

    if (message_command.length == 0)
        return;

    let command = squid.commands.get(message_command);

    if (command) {
        database.get_guild_config_value(message.guild.id, `settings/use_beta_features`).then(snapshot => {
            if (!snapshot.val())
                return;
            var data = snapshot.val();
            if (!data) {
                if (command.beta == true) {
                    message.reply(`This command is a beta feature which means it's under development. If you want to use beta features in this server, run \`s!config set use_beta_features=true\`, however keep in mind that these commands are not guaranteed to work properly and can cause bugs/crashes.`)
                    return;
                }
            }
            switch (command.permission_level) {
                case 0: command.run(squid, message, args);
                    break;
                case 1: if (message.member.hasPermission("MANAGE_MESSAGES") || message.author.id == config.bot_owner_id) command.run(squid, message, args);
                else message.reply("You don't have the permission to run this command!");
                    break;
                case 2: if (message.member.hasPermission("MANAGE_GUILD") || message.author.id == config.bot_owner_id) command.run(squid, message, args);
                else message.reply("You don't have the permission to run this command!");
                    break;
                case 3: if (message.member == message.guild.owner || message.author.id == config.bot_owner_id) command.run(squid, message, args);
                else message.reply("You don't have the permission to run this command!");
                    break;
                case 4: if (message.author.id == config.bot_owner_id) command.run(squid, message, args);
                else message.reply("You don't have the permission to run this command!");
            }
        });
    }
});

squid.login(process.env.SQUID_TOKEN);