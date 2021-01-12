const
    { MessageEmbed } = require(`discord.js`),
    config = require(`../config.js`);

module.exports = {
    name: "help",
    enabled: true,
    permission_level: 0,
    description: "Shows info about the bot",
    args: 0,
    usage: "[command]",
    run: async (client, message, args) => {
        if (args.length == 0) {
            var list = ``;

            client.commands.forEach(c => {
                list += `\`${c.name}\`**  **  **  **`;
            });

            const embed = new MessageEmbed()
                .setAuthor(client.user.username, client.user.displayAvatarURL({ format: 'png', size: 512 }), client.user.displayAvatarURL({ format: 'png', size: 512 }))
                .setColor(message.member.displayColor)
                .setTitle(`Squid Help`)
                .setDescription(list)
                .addField(`Info`, `Prefix: \`${client.prefix}\`\nBot created by: \`${config.mante_tag}\`, credits for the Squid Says gamemode to \`${config.sputnix_tag}\`. Bot version: \`${config.bot_version}\``, true)
                .addField(`Documentation`, `https://github.com/mantevian/squid\n\nhttps://mantevian.github.io/squid.html`, true);

            message.channel.send(embed);
        }
        else if (args.length == 1) {
            const command = client.commands.find(c => c.name == args[0]);
            if (!command) {
                message.reply(`Command not found.`);
                return;
            }
            const embed = new MessageEmbed()
                .setAuthor(client.user.username, client.user.displayAvatarURL({ format: 'png', size: 512 }), client.user.displayAvatarURL({ format: 'png', size: 512 }))
                .setColor(message.member.displayColor)
                .setTitle(`Squid Help`)
                .setDescription(`\`${`${command.name} ${command.usage}`.trim()}\` [${command.permission_level}] ${command.description}. ${command.enabled ? "" : "*Disabled*"}\n`);

            message.channel.send(embed);
        }
    }
}