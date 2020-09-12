const fs = require(`fs`);

module.exports = (client) => {
    const commands = fs.readdirSync(`./commands/${client.name}/`).filter(f => f.endsWith(`.js`));

    for (let file of commands) {
        let command = require(`../commands/${client.name}/${file}`);

        if (command.enabled)
            client.commands.set(command.name, command);
    }
}