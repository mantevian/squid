const
    fs = require(`fs`),
    { RNG } = require(`../utils/seeded_random.js`),
    utils = require(`../utils/util_functions.js`),
    { promisify } = require(`util`),
    JSZip = require(`jszip`),
    zip = new JSZip(),
    SimplexNoise = require(`simplex-noise`),
    readdir = promisify(fs.readdir),
    database = require(`../utils/firebase_connection.js`);

module.exports = {
    name: "eval",
    enabled: true,
    permission_level: 4,
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