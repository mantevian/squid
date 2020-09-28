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

const commands = fs.readdirSync(`./commands/`).filter(f => f.endsWith(`.js`));

for (let file of commands) {
    let command = require(`./commands/${file}`);

    if (command.enabled)
        squid.commands.set(command.name, command);
}

squid.on(`ready`, () => {
    squid.user.setActivity(`Mante`, { type: `LISTENING` });
    console.log(`squiddley`);
    require(`./utils/save_triggers.js`)(squid);
});

squid.on(`message`, message => {
    require(`./utils/message_trigger.js`).run(message, squid);

    if (message.author.bot || !message.guild || !(message.content.startsWith(squid.prefix) || message.content.startsWith(`s!`))) {
        require(`./utils/leveling.js`).run(message, squid);
        return;
    }

    let args = message.content.slice(squid.prefix.length).trim().split(/ +/g);
    let message_command = args.shift().toLowerCase();

    if (message_command.length == 0)
        return;

    let command = squid.commands.get(message_command);

    if (command) {
        database.get_guild_config_value(message.guild.id, `use_beta_features`).then(snapshot => {
            if (!snapshot.val())
                return;
            var enable_beta = snapshot.val();
            if (enable_beta === false && command.beta === true) {
                message.reply(`This command is a beta feature which means it's under development. If you want to use beta features in this server, run \`s!config set use_beta_features=true\`, however keep in mind that these commands are not guaranteed to work properly and can cause bugs/crashes.`);
                return;
            }
            var users_perm_level = 0;
            if (message.member.hasPermission("MANAGE_MESSAGES"))
                users_perm_level = 1;
            if (message.member.hasPermission("MANAGE_GUILD"))
                users_perm_level = 2;
            if (message.member == message.guild.owner)
                users_perm_level = 3;
            if (message.author.id == config.bot_owner_id)
                users_perm_level = 4;

            if (command.permission_level <= users_perm_level)
                command.run(squid, message, args);
            else
                message.reply("You don't have the permission to run this command!");
        });
    }
});

squid.login(process.env.SQUID_TOKEN);