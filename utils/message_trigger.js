const
    database = require(`./firebase_connection.js`),
    utils = require(`./util_functions.js`);

module.exports = {
    run: async function run(message, client, trigger_type) {
        if (!message.guild)
            return;

        const triggers = client.message_triggers.array();

        for (var g = 0; g < triggers.length; g++) {
            const guild_triggers = Object.entries(triggers[g]);

            for (var j = 0; j < guild_triggers.length; j++) {
                let t = guild_triggers[j][1];
                if (!t.enabled)
                    continue;

                if (t.type != trigger_type)
                    continue;

                if (t.channel_id != -1)
                    if (message.channel.id != t.channel_id)
                        continue;

                if (!t.requirements || !t.actions)
                    return;

                let requirements = Object.entries(t.requirements);

                var requirements_met = true;

                async function check_requirements(requirements) {
                    for (var i = 0; i < requirements.length; i++) {
                        let r = requirements[i][1];
                        switch (r.requirement) {
                            case `always`:
                                break;

                            case `chance`:
                                if (Math.random() > r.chance)
                                    requirements_met = false;
                                break;

                            case `author_has_role`:
                                if (!utils.has_role(message.guild, message.author.id, r.role_id))
                                    if (!r.inverted)
                                        requirements_met = false;

                                if (utils.has_role(message.guild, message.author.id, r.role_id))
                                    if (r.inverted)
                                        requirements_met = false;
                                break;

                            case `message_content`:
                                if (r.message_content_includes && r.case_sensitive)
                                    if (!message.content.includes(r.text)) {
                                        requirements_met = false;
                                    }

                                if (r.message_content_includes && !r.case_sensitive)
                                    if (!message.content.toLowerCase().includes(r.text.toLowerCase())) {
                                        requirements_met = false;
                                    }

                                if (!r.message_content_includes && r.case_sensitive)
                                    if (message.content.toLowerCase() != r.text.toLowerCase()) {
                                        requirements_met = false;
                                    }

                                if (!r.message_content_includes && !r.case_sensitive)
                                    if (message.content != r.text) {
                                        requirements_met = false;
                                    }
                                break;

                            case `content_is_number`:
                                if (parseInt(message.content) == NaN || !parseInt(message.content))
                                    if (!r.inverted)
                                        requirements_met = false;

                                if (parseInt(message.content) != NaN && parseInt(message.content))
                                    if (r.inverted)
                                        requirements_met = false;

                                let n = parseInt(message.content);

                                if (r.max && r.min) {
                                    if (n > r.max || n < r.min)
                                        if (!r.inverted)
                                            requirements_met = false;

                                    if (n <= r.max && n >= r.min)
                                        if (r.inverted)
                                            requirements_met = false;
                                }
                                break;

                            case `previous_message_author`:
                                let messages = await message.channel.messages.fetch({ limit: 2 });
                                let m = messages.last();
                                if (r.author_id == -1 && !r.inverted)
                                    if (message.author.id != m.author.id)
                                        requirements_met = false;

                                if (r.author_id == -1 && r.inverted)
                                    if (message.author.id == m.author.id)
                                        requirements_met = false;
                                break;

                            case `author_stats`:
                                var snapshot = await database.get_user_value(message.guild.id, message.author.id, r.stat_name);
                                if (!snapshot || snapshot.val() == null)
                                    return;

                                var stat = await snapshot.val();
                                if (r.operation == `<`)
                                    if (stat >= r.value)
                                        requirements_met = false;

                                if (r.operation == `>`)
                                    if (stat <= r.value)
                                        requirements_met = false;

                                if (r.operation == `<=`)
                                    if (stat > r.value)
                                        requirements_met = false;

                                if (r.operation == `>=`)
                                    if (stat < r.value)
                                        requirements_met = false;

                                if (r.operation == `=`)
                                    if (stat != r.value)
                                        requirements_met = false;

                                if (r.operation == `!=`)
                                    if (stat == r.value)
                                        requirements_met = false;
                                break;

                            case `compare_messages_content`:
                                let compared_channel_id = message.channel.id;
                                if (r.compared_channel_id != -1)
                                    compared_channel_id = r.channel_id;

                                let message_amount = -1;
                                let compared_message_id = r.compared_message_id;
                                if (r.compared_message_id < 0) {
                                    message_amount = -r.compared_message_id + 1;
                                    let messages = await message.guild.channels.cache.find(c => c.id == compared_channel_id)
                                        .messages.fetch({ limit: message_amount });
                                    let m = compared_message_id;
                                    if (message_amount > 0)
                                        m = messages.last();

                                    let current_content = message.content;
                                    let second_content = m.content;

                                    switch (r.compare_type) {
                                        case `number`:
                                            switch (r.compare_operation) {
                                                case `>`:
                                                    if (parseInt(current_content) <= parseInt(second_content))
                                                        requirements_met = false;
                                                    break;

                                                case `>=`:
                                                    if (parseInt(current_content) < parseInt(second_content))
                                                        requirements_met = false;
                                                    break;

                                                case `<`:
                                                    if (parseInt(current_content) >= parseInt(second_content))
                                                        requirements_met = false;
                                                    break;

                                                case `<=`:
                                                    if (parseInt(current_content) > parseInt(second_content))
                                                        requirements_met = false;
                                                    break;

                                                case `=`:
                                                    if (parseInt(current_content) != parseInt(second_content))
                                                        requirements_met = false;
                                                    break;
                                            }
                                            break;
                                        case `lexicographical`:
                                            switch (r.compare_operation) {
                                                case `>`:
                                                    if (current_content <= second_content)
                                                        requirements_met = false;
                                                    break;

                                                case `>=`:
                                                    if (current_content < second_content)
                                                        requirements_met = false;
                                                    break;

                                                case `<`:
                                                    if (current_content >= second_content)
                                                        requirements_met = false;
                                                    break;

                                                case `<=`:
                                                    if (current_content > second_content)
                                                        requirements_met = false;
                                                    break;

                                                case `=`:
                                                    if (current_content != second_content)
                                                        requirements_met = false;
                                                    break;
                                            }
                                            break;
                                    }
                                }
                                break;
                        }
                    }
                    return requirements_met;
                }

                async function do_actions(actions) {
                    for (var i = 0; i < actions.length; i++) {
                        let a = actions[i][1];

                        switch (a.action) {
                            case `set_role_mentionable`:
                                switch (a.force_mentionable) {
                                    case -1:
                                        utils.set_role_mentionable(message.guild, a.role_id, !utils.get_role_mentionable(message.guild, a.role_id));
                                        break;

                                    case 0:
                                        utils.set_role_mentionable(message.guild, a.role_id, false);
                                        break;

                                    case 1:
                                        utils.set_role_mentionable(message.guild, a.role_id, true);
                                        break;
                                }
                                break;

                            case `send_message`:
                                if (a.channel_id == -1)
                                    message.channel.send(a.text);

                                else
                                    message.guild.channels.cache.find(c => c.id == a.channel_id).send(a.text);
                                break;

                            case `set_user_role`:
                                let u_id = message.author.id;
                                if (a.user_id != -1 && a.user_id != undefined && a.user_id != null)
                                    u_id = a.user_id;

                                switch (a.forced_role) {
                                    case -1:
                                        if (utils.has_role(message.guild, u_id, a.role_id))
                                            utils.remove_role(message.guild, u_id, a.role_id);
                                        else
                                            utils.add_role(message.guild, u_id, a.role_id);
                                        break;

                                    case 0:
                                        utils.remove_role(message.guild, u_id, a.role_id);
                                        break;

                                    case 1:
                                        utils.add_role(message.guild, u_id, a.role_id);
                                        break;
                                }
                                break;

                            case `delete_message`:
                                if (message.deletable)
                                    message.delete({ timeout: a.timeout, reason: a.reason });
                                break;

                            case `suppress_message_embeds`:
                                message.suppressEmbeds();
                                break;

                            case `pin_message`:
                                message.pin();
                                break;

                            case `unpin_message`:
                                message.unpin();
                                break;

                            case `react_message`:
                                if (a.emoji.startsWith("<"))
                                    message.react(message.guild.emojis.cache.get(a.emoji.split(`:`)[2].slice(0, -1)));
                                else
                                    message.react(a.emoji);
                                break;

                            case `set_user_stats`:
                                var stat;
                                var snapshot = await database.get_user_value(message.guild.id, message.author.id, a.stat_name);
                                if (!snapshot || snapshot.val() == null)
                                    stat = 0;
                                else
                                    stat = await snapshot.val();

                                switch (a.operation) {
                                    case `set`:
                                        stat = a.value;
                                        break;

                                    case `add`:
                                        stat += a.value;
                                        break;

                                    case `remove`:
                                        stat -= a.value;
                                        break;

                                    case `multiply`:
                                        stat *= a.value;
                                        break;

                                    case `divide`:
                                        stat /= a.value;
                                        break;

                                    case `divide_int`:
                                        stat = Math.floor(stat / a.value);
                                        break;

                                    case `power`:
                                        stat = Math.pow(stat, a.value);
                                        break;

                                    case `sqrt`:
                                        stat = Math.sqrt(stat, a.value);
                                        break;

                                    case `sqrt_int`:
                                        stat = Math.floor(Math.sqrt(stat, a.value));
                                        break;
                                }
                                
                                var id = message.author.id;
                                if (a.user_id != `-1`)
                                    id = a.user_id;

                                database.set_user_value(message.guild, id, a.stat_name, a.value);
                                break;
                        }
                    }
                }

                check_requirements(requirements).then(req => {
                    if (!req) return;
                    const actions = Object.entries(t.actions);
                    do_actions(actions);
                });
            }
        }
    }
}