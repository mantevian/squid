module.exports = {
    name: "ping",
    enabled: true,
    permission_level: 0,
    description: "Checks the server's responce time",
    usage: "",
    run: async (client, message, args) => {
        const msg = await message.channel.send(`Pinging...`);
        msg.edit(`Ping: \`${Math.round(msg.createdAt - message.createdAt)} ms\`.`);
    }
}