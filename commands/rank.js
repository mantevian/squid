const
    database = require(`../utils/firebase_connection.js`),
    { createCanvas, loadImage, registerFont } = require('canvas'),
    fs = require('fs'),
    request = require('request'),
    { lerp } = require(`../utils/util_functions`),
    { MessageEmbed } = require(`discord.js`),
    utils = require(`../utils/util_functions.js`);

module.exports = {
    name: "rank",
    enabled: true,
    permission_level: 0,
    beta: false,
    description: "Displays your stats on a server such as XP and Level",
    args: 0,
    usage: "[user id]",
    run: async (client, message, args) => {
        const args_config = utils.args_parse(message.content);

        var id = message.author.id;
        var member = message.member;
        var user = message.author;

        if (args[0]) {
            id = args_config.id;
            member = message.guild.members.cache.find(m => m.id == id);
            if (!member) {
                message.reply(`Can't find that user.`);
                return;
            }
            user = message.guild.members.cache.find(m => m.id == id).user;
        }

        const r_download = function (uri, filename, callback) {
            request.head(uri, function () {
                request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
            });
        };

        const guild_xp_enabled = (await database.get_guild_config_value(message.guild.id, `settings/xp_enabled`)).val();
        const guild_old_leveling = (await database.get_guild_config_value(message.guild.id, `settings/old_leveling`)).val();

        if (guild_xp_enabled == undefined) {
            database.create_guild(message.guild.id);
            return;
        }

        if (guild_xp_enabled == false) {
            message.reply(`Leveling is disabled in this server.`);
            return;
        }

        var stats = (await database.get_user_data(message.guild.id, id)).val();

        if (!stats) {
            message.reply(`Can't fetch your data! Make sure you've got some XP first.`);
            return;
        }

        var xp = stats.xp;
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
        var xp_text = `${xp - temp_xp} / ${level_xp - temp_xp}`;
        var profile_color_int = member.displayColor;
        if (profile_color_int < 16)
            profile_color_int = 16777215;
        profile_color = '000000' + profile_color_int.toString(16);
        profile_color = profile_color.slice(-6);

        registerFont(`./resources/neucha.ttf`, { family: "Neucha" });

        if (args_config.custom) {
            var stats_array = Object.entries(stats);
            var list = ``;

            for (var i = 0; i < stats_array.length; i++)
                if (stats_array[i][1] != `last_xp_message_timestamp`)
                    list += `**${stats_array[i][0]}:** ${stats_array[i][1]}`;

            const embed = new MessageEmbed()
                .setAuthor(user.username, user.displayAvatarURL({ format: `png`, size: 256 }))
                .setTitle(`Stats in ${message.guild.name}`)
                .setDescription(list)
                .setTimestamp(Date.now());

            message.channel.send(embed);
            return;
        }

        r_download(user.displayAvatarURL({ format: `png`, size: 256 }), `${__dirname}/avatar_${id}.png`, async function () {
            const canvas = createCanvas(700, 336);
            var ctx = canvas.getContext(`2d`);

            let rank_image = await loadImage(`./resources/default_rank.png`);
            ctx.drawImage(rank_image, 0, 0);

            const name = user.username;

            ctx.font = `${Math.min(35, 32 - name.length)}pt Neucha`
            ctx.textBaseline = `top`;

            ctx.fillStyle = `#fff`;
            var name_placing = 63 + name.length * 3.5;
            ctx.textAlign = `right`;
            ctx.fillText(name, 70 + name_placing, 245 + name.length / 3);

            ctx.font = `${Math.min(15, 20 - name.length / 2)}pt Neucha`
            ctx.globalAlpha = 0.5;
            ctx.textAlign = `left`;
            ctx.fillText(`#${user.discriminator}`, 74 + name_placing, 257);

            ctx.globalAlpha = 1;
            ctx.font = `30pt Neucha`;
            ctx.fillText(xp, 310, 63);
            ctx.fillText(level, 562, 65);
            ctx.fillText(`${Math.floor(100 * xp_ratio)}%`, 400, 120);

            const percent_width = ctx.measureText(`${Math.floor(100 * xp_ratio)}%`).width;
            ctx.fillStyle = `#888888`;
            ctx.font = `20pt Neucha`;
            ctx.fillText(`(${xp_text})`, 410 + percent_width, 127);

            ctx.fillStyle = `#99ffff`;

            let circles = [
                { x: 331, y: 270 },
                { x: 377, y: 261 },
                { x: 417, y: 278 },
                { x: 466, y: 262 },
                { x: 508, y: 259 },
                { x: 552, y: 266 },
                { x: 598, y: 265 },
                { x: 646, y: 270 }
            ]

            for (var i = 0; i < circles.length; i++) {
                var c = `rgba(0,0,0,0)`;

                if (xp_ratio >= (i + 1) / circles.length)
                    c = `rgba(153,255,255,1)`;

                if (xp_ratio >= i / circles.length && xp_ratio < (i + 1) / circles.length)
                    c = `rgba(153,255,255,${lerp(0.1, 0.9, xp_ratio * circles.length - i)})`;

                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(circles[i].x, circles[i].y, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            }

            let pfp = await loadImage(__dirname + `/avatar_${id}.png`);
            ctx.save();
            ctx.beginPath();
            ctx.arc(115, 100, 60, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(pfp, 55, 40, 120, 120);

            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.closePath();
            ctx.restore();

            const buffer = canvas.toBuffer(`image/png`);
            fs.writeFileSync(`${__dirname}/rank.png`, buffer);

            message.channel.send({
                files: [{
                    attachment: `${__dirname}/rank.png`,
                    name: `rank.png`
                }]
            });
        });
    }
}