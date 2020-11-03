const
    database = require(`../utils/firebase_connection.js`),
    { createCanvas, loadImage, registerFont } = require(`canvas`),
    fs = require(`fs`),
    utils = require(`../utils/util_functions.js`),
    { MessageEmbed } = require(`discord.js`);

module.exports = {
    name: "leaderboard",
    enabled: true,
    permission_level: 0,
    beta: false,
    description: "Shows server's leaderboard by XP",
    args: 1,
    usage: "[page]",
    run: async (client, message, args) => {
        var config = utils.args_parse(message.content);
        var page;
        if (!config.page)
            page = 1;
        else
            page = config.page;

        var list = [];

        var stats_length;

        const guild_xp_enabled = (await database.get_guild_config_value(message.guild.id, `settings/xp_enabled`)).val();
        const guild_old_leveling = (await database.get_guild_config_value(message.guild.id, `settings/old_leveling`)).val();

        if (guild_xp_enabled == undefined) {
            database.create_guild(message.guild.id);
            return;
        }

        if (guild_xp_enabled == false)
            return;

        var stats_length = (await database.get_guild_config_value(message.guild.id, `stats_length`)).val();
        if (page * 10 - 10 >= stats_length - 1) {
            message.reply(`Nothing found.`);
            return;
        }

        if (page < 1) page = 1;
        var min = page * 10 - 9;
        var max = page * 10;
        if (max > stats_length - 1) max = stats_length;

        var n = 0;

        if (config.stat_name) {
            list = ``;
            let ref = database.db.ref(`/guild_stats/${message.guild.id}`).orderByChild(config.stat_name);
            ref.on(`child_added`, async function (snapshot) {
                var name = `?`;
                var discrim = `?`;

                if (!client.guilds.cache.find(g => g.id == message.guild.id).members.cache.find(m => m.user.id == snapshot.key)) name = snapshot.key
                else {
                    m = client.guilds.cache.find(g => g.id == message.guild.id).members.cache.find(m => m.user.id == snapshot.key);
                    name = m.user.username;
                    discrim = m.user.discriminator;
                }

                var stat = snapshot.val()[config.stat_name];
                if (!stat)
                    stat = 0;

                if (n <= stats_length - min && n >= stats_length - max) {
                    list += `**${stats_length - n}.** ${name}#${discrim}: ${stat}\n`
                }

                if (n == stats_length - 1) {
                    list = list.split(`\n`).reverse().join(`\n`);

                    var guild_stats = client.scoreboards.get(message.guild.id);

                    var display_name = `XP`;

                    if (config.stat_name == `level`)
                        display_name = `Level`;

                    else if (guild_stats[`${config.stat_name}`])
                        display_name = guild_stats[`${config.stat_name}`].display_name;

                    var embed = new MessageEmbed()
                    .setTitle(`${message.guild.name} leaderboard // ${display_name} // Page ${page}`)
                    .setDescription(list);

                    message.channel.send(embed);

                    ref.off();
                }
                n++;
            });

            return;
        }

        let ref = database.db.ref(`/guild_stats/${message.guild.id}`).orderByChild(`xp`);
        ref.on(`child_added`, async function (snapshot) {
            var name = `?`;
            var discrim = `?`;
            var color = [204, 204, 204];

            if (!client.guilds.cache.find(g => g.id == message.guild.id).members.cache.find(m => m.user.id == snapshot.key)) name = snapshot.key
            else {
                m = client.guilds.cache.find(g => g.id == message.guild.id).members.cache.find(m => m.user.id == snapshot.key);
                name = m.user.username;
                discrim = `#${m.user.discriminator}`;
                var color_int = m.displayColor;
                color = [Math.floor(color_int / 65536), Math.floor(color_int / 256) % 256, color_int % 256];
            }

            var xp = snapshot.val().xp;
            var temp_xp = xp;
            var level = 0;
            var level_xp = 100;
            while (xp >= level_xp) {
                level++;
                if (guild_old_leveling == true) {
                    level_xp += level * level + 50 * level + 100;
                    temp_xp = level_xp - level * level - 50 * level - 100;
                }
                else {
                    var xp_mod = Math.floor(level * (level * level + 20 * level + 800) / 35.49165) + 131;
                    level_xp += xp_mod;
                    temp_xp = level_xp - xp_mod;
                }
            }
            if (xp == temp_xp)
                temp_xp = 0;
            var xp_ratio = (xp - temp_xp) / (level_xp - temp_xp);

            if (n <= stats_length - min && n >= stats_length - max) {
                list.push({
                    number: stats_length - n,
                    name: name,
                    discrim: discrim,
                    color: color,
                    level: level,
                    xp_ratio: xp_ratio
                });
            }

            if (n == stats_length - 1) {
                list = list.reverse();

                registerFont(`./resources/neucha.ttf`, { family: "Neucha" });
                registerFont(`./resources/sans-serif.ttf`, { family: "Neucha" });

                const canvas = createCanvas(800, 800);
                var ctx = canvas.getContext(`2d`);

                let leaderboard_image = await loadImage(`./resources/default_leaderboard.png`);
                ctx.drawImage(leaderboard_image, 0, 0);

                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 2;
                ctx.shadowColor = `#00000000`;

                ctx.font = `40pt Neucha`;
                ctx.globalAlpha = 1;

                ctx.fillStyle = `#fff`;
                ctx.textAlign = `center`;
                ctx.fillText(`${message.guild.name} Leaderboard`, 350, 80);
                ctx.fillText(page, 736, 86);
                ctx.textAlign = `start`;

                for (var i = 0; i < 10; i++) {
                    if (!list[i])
                        continue;

                    ctx.globalAlpha = 1.0;
                    ctx.font = `bold 35pt Neucha`;
                    ctx.fillStyle = `#fff`;
                    ctx.textAlign = `center`;
                    ctx.fillText(list[i].number, 68, i * 67 + 175);

                    ctx.font = `33pt Neucha`;
                    ctx.fillStyle = `rgb(${Math.floor(Math.min(list[i].color[0] * 1.25, 255))},${Math.floor(Math.min(list[i].color[1] * 1.5, 255))},${Math.floor(Math.min(list[i].color[2] * 1.75, 255))})`;
                    let name = list[i].name;
                    if (name.length > 16)
                        name = name.slice(0, 15) + `...`;

                    let w = ctx.measureText(name).width;

                    ctx.textAlign = `start`;
                    ctx.fillText(name, 150, i * 67 + 174);

                    ctx.fillStyle = `#999`;
                    ctx.font = `22pt Neucha`;
                    ctx.fillText(`${list[i].discrim}`, 160 + w, i * 67 + 173);

                    ctx.textAlign = `end`;
                    ctx.font = `32pt Neucha`;
                    ctx.fillStyle = `rgb(${Math.floor(Math.min(list[i].color[0] * 1.25, 255))},${Math.floor(Math.min(list[i].color[1] * 1.5, 255))},${Math.floor(Math.min(list[i].color[2] * 1.75, 255))})`;
                    ctx.fillText(`lv ${list[i].level}`, 750, i * 67 + 175);

                    ctx.font = `26pt Neucha`;
                    ctx.fillStyle = `#aaa`;
                    ctx.fillText(`${Math.floor(list[i].xp_ratio * 100)}%`, 630, i * 67 + 174);

                    let glow = await loadImage(`./resources/leaderboard_glow.png`);

                    ctx.globalAlpha = list[i].xp_ratio * 0.75;
                    ctx.shadowColor = `rgb(${list[i].color[0]},${list[i].color[1]},${Math.floor(Math.min(list[i].color[2] * 2, 255))})`;
                    ctx.drawImage(glow, 146, i * 67 + 107);
                    ctx.shadowColor = `#00000000`;
                    ctx.globalAlpha = 1.0;
                }

                const buffer = canvas.toBuffer('image/png');
                fs.writeFileSync(`${__dirname}/leaderboard.png`, buffer);

                message.channel.send({
                    files: [{
                        attachment: `${__dirname}/leaderboard.png`,
                        name: `leaderboard.png`
                    }]
                });

                ref.off();
            }
            n++;
        });
    }
}