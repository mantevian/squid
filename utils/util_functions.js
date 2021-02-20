module.exports.args_parse = function args_parse(text) {
    var args = {};
    const split_text = text.split(/[ ]+/);
    const args_count = split_text.length;
    var reading_string = false;
    var current_field = "";
    for (var i = 0; i < args_count; i++) {
        let arg = split_text[i];
        let field = arg.split(`=`)[0];
        let value = arg.substring(field.length + 1);

        if (value == "true") {
            args[field] = true;
            continue;
        }

        if (value == "false") {
            args[field] = false;
            continue;
        }

        if (value == "null") {
            args[field] = null;
            continue;
        }

        if (parseInt(value, 10).toString() == value) {
            args[field] = parseInt(value);
            continue;
        }

        if (parseFloat(value).toString() == value) {
            args[field] = parseFloat(value);
            continue;
        }

        if (!reading_string) {
            current_field = field;

            if (arg.includes(`=`)) {
                args[field] = value;

                if (value.startsWith(`"`)) {
                    args[current_field] = value.substring(1);
                    reading_string = true;

                    if (value.endsWith(`"`)) {
                        args[current_field] = value.slice(1, -1);
                        reading_string = false;
                    }
                }
            }
        }
        else {
            if (!args[current_field])
                args[current_field] = "";

            args[current_field] += " ";

            if (arg.endsWith(`"`)) {
                reading_string = false;
                args[current_field] += arg.slice(0, -1);
            }
            else
                args[current_field] += arg;
        }
    }

    return args;
}

module.exports.random_choice = function random_choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

module.exports.has_role = function has_role(g, u, r) {
    if (!u)
        return false;
    if (g.members.cache.find(m => m.id == u).roles.cache.find(ro => ro.id == r)) return true;
    return false;
}

module.exports.find_role = function find_role(g, r) {
    if (g.roles.cache.find(ro => ro.id == r)) return g.roles.cache.find(ro => ro.id == r);
    return undefined;
}

module.exports.set_role_mentionable = function set_role_mentionable(g, r, m) {
    if (!g.roles.cache.find(ro => ro.id == r))
        return;
    else {
        var role = g.roles.cache.find(ro => ro.id == r);
        role.setMentionable(m);
    }
}

module.exports.get_role_mentionable = function get_role_mentionable(g, r) {
    if (!g.roles.cache.find(ro => ro.id == r))
        return;
    else {
        return g.roles.cache.find(ro => ro.id == r).mentionable;
    }
}

module.exports.add_role = function add_role(g, m, r) {
    var role = g.roles.cache.find(role => role.id == r);
    if (!role)
        return;

    g.members.cache.find(mem => mem.id == m).roles.add(role);
}

module.exports.remove_role = function remove_role(g, m, r) {
    var role = g.roles.cache.find(role => role.id == r);
    if (!role)
        return;

    g.members.cache.find(mem => mem.id == m).roles.remove(role);
}

module.exports.rm_arr_by_val = function rm_arr_by_val(a, v) {
    var pos = a.indexOf(v);
    a.splice(v, 1);
    return a;
}

module.exports.lerp = function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

module.exports.weighted_random_choice = function weighted_random_choice(arr) {
    var entries = [];
    var accumulated_weight = 0;

    for (var i = 0; i < arr.length; i++) {
        accumulated_weight += arr[i].weight;
        entries.push({ item: arr[i].item, accumulated_weight: accumulated_weight });
    }
    
    for (var i = 0; i < arr.length; i++) {
        var r = Math.random() * accumulated_weight;
        if (entries[i].accumulated_weight >= r)
            return entries[i].item;
    }
}

module.exports.replace_all = function replace_all(str, from, to) {
    return str.split(from).join(to);
}