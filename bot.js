const
    Discord = require(`discord.js`),
    fs = require(`fs`),
    config = require(`./config.js`),
    database = require(`./utils/firebase_connection.js`);

const client = new Discord.Client();
client.prefix = "s/";

client.commands = new Discord.Collection();
client.message_triggers = new Discord.Collection();
client.scoreboards = new Discord.Collection();

const commands = fs.readdirSync(`./commands/`).filter(f => f.endsWith(`.js`));

for (let file of commands) {
    let command = require(`./commands/${file}`);

    if (command.enabled)
        client.commands.set(command.name, command);
}

client.squid_says_minigames = [];
const squid_says_games = fs.readdirSync(`./resources/squid_says_minigames`).filter(f => f.endsWith('.js'));

for (const file of squid_says_games) {
    const game = require(`./resources/squid_says_minigames/${file}`)
    client.squid_says_minigames.push(game);
}

client.on(`ready`, () => {
    client.user.setActivity(`Mante`, { type: `LISTENING` });
    console.log(`squiddley`);
    require(`./utils/save_triggers.js`)(client);
    require(`./utils/save_guild_scoreboards.js`)(client);
});

client.on(`message`, message => {
    console.log(message.guild.id)

    require(`./utils/message_trigger.js`).run(message, client, `sent`);

    if (!message.guild || message.author.bot)
        return;

    if (!(message.content.startsWith(client.prefix) || message.content.startsWith(`s!`))) {
        require(`./utils/leveling.js`).run(message, client);
        return;
    }

    let args = message.content.slice(client.prefix.length).trim().split(/ +/g);
    let message_command = args.shift().toLowerCase();

    if (message_command.length == 0)
        return;

    let command = client.commands.get(message_command);

    if (command) {
        console.log(message.guild.id)
        database.get_guild_config_value(message.guild.id, `use_beta_features`).then(snapshot => {
            if (!snapshot.val())
                return;
            console.log(message.author.username)
            var enable_beta = snapshot.val();
            if (enable_beta == false && command.beta == true) {
                message.reply(`This command is a beta feature which means it's under development. If you want to use beta features in this server, run \`s!config set use_beta_features=true\`, however keep in mind that these commands are not guaranteed to work properly and can cause bugs/crashes.`);
                return;
            }
            console.log(message.content)
            var users_perm_level = 0;
            if (message.member.hasPermission("MANAGE_MESSAGES"))
                users_perm_level = 1;
            if (message.member.hasPermission("MANAGE_GUILD"))
                users_perm_level = 2;
            if (message.member == message.guild.owner)
                users_perm_level = 3;
            if (message.author.id == config.bot_owner_id)
                users_perm_level = 4;
            console.log(users_perm_level)

            if ((users_perm_level == 4 && command.permission_level == 4)) {
                try {
                    command.run(client, message, args);
                }
                catch (error) {
                    console.error(error);
                    message.channel.send(`An error has occured while executing this command. ${error}`);
                }
            }

            else if (command.permission_level <= users_perm_level) {
                try {
                    command.run(client, message, args);
                }
                catch (error) {
                    console.error(error);
                    message.channel.send(`An error has occured while executing this command. ${error}`);
                }
            }
            else
                message.reply(`You don't have the permission to run this command!`);
        });
    }
});

client.on(`messageUpdate`, (old_message, new_message) => {
    require(`./utils/message_trigger.js`).run(new_message, client, `edited`);
});

client.on(`messageDelete`, message => {
    require(`./utils/message_trigger.js`).run(message, client, `deleted`);
});

client.login(process.env.SQUID_TOKEN);