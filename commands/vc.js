const
    ytdl = require('ytdl-core-discord');

module.exports = {
    name: "vc",
    enabled: true,
    permission_level: 0,
    beta: true,
    description: "Manage Squid's voice connection",
    usage: "<join/leave> <channel name> OR <play> <YouTube link> <channel name>",
    run: async (client, message, args) => {
        async function play(connection, url) {
            connection.play(await ytdl(url), { type: 'opus' });
        }
        switch (args[0]) {
            case `join`:
                message.guild.channels.cache.find(c => c.name.toLowerCase().includes(args.slice(1).join(` `).toLowerCase())).join()
                .then(connection => {
                    message.channel.send(`Connected to ${connection.channel.name}!`);
                });
                break;
            case `play`:
                message.guild.channels.cache.find(c => c.name.toLowerCase().includes(args.slice(2).join(` `).toLowerCase())).join()
                    .then(connection => {
                        play(connection, args[1]);
                        message.channel.send(`Playing the audio in ${connection.channel.name}!`);
                    });
                break;
            case `leave`:
                client.voice.connections.find(c => c.channel.guild.id == message.guild.id).disconnect();
                message.channel.send(`Disconnected from any channel in this server.`);
        }
    }
}