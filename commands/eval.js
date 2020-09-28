module.exports = {
    name: "eval",
    enabled: true,
    permission_level: 4,
    beta: false,
    description: "Evaluates a JavaScript code",
    args: 1,
    usage: "<code>",
    run: async (client, message, args) => {
        var code = args.join(` `);
        try {
            var evaled = eval(code);
            if (!evaled || evaled.length == 0)
                return;
            message.channel.send(evaled);
        }
        catch (err) {
            message.channel.send(err);
        }
    }
}