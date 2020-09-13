module.exports.args_parse = function args_parse(text) {
    var args = {};
    const split_text = text.split(/[ ]+/);
    const args_count = split_text.length;
    var reading_string = false;
    var current_field = "";
    for (var i = 0; i < args_count; i++) {
        let arg = split_text[i];
        let field = arg.split(`=`)[0];
        let value = arg.split(`=`)[1];

        if (value == "true") {
            args[field] = true;
            continue;
        }

        if (value == "false") {
            args[field] = false;
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

module.exports.random_string = function random_string() {
    return arguments[Math.floor(Math.random() * arguments.length)]
}

module.exports.random_string_array = function random_string_array(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

module.exports.has_role = function has_role(m, r) {
    if (m.roles.cache.find(ro => ro.name == r)) return true;
    return false;
}

module.exports.has_role_id = function has_role_id(g, u, r) {
    if (!u)
        return false;
    if (g.members.cache.find(m => m.id == u).roles.cache.find(ro => ro.id == r)) return true;
    return false;
}

module.exports.has_role_includes = function has_role_includes(m, r) {
    if (m.roles.cache.find(ro => ro.name.toLowerCase().includes(r.toLowerCase()))) return true;
    return false;
}

module.exports.find_role = function find_role(g, r) {
    if (g.roles.cache.find(ro => ro.name == r)) return g.roles.cache.find(ro => ro.name == r);
    return undefined;
}

module.exports.find_role_id = function find_role_id(g, r) {
    if (g.roles.cache.find(ro => ro.id == r)) return g.roles.cache.find(ro => ro.id == r);
    return undefined;
}

module.exports.find_role_includes = function find_role_includes(g, r) {
    if (g.roles.cache.find(ro => ro.name.toLowerCase().includes(r.toLowerCase()))) return g.roles.cache.find(ro => ro.name.toLowerCase().includes(r.toLowerCase()));
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
    g.members.cache.find(mem => mem.id == m).roles.add(g.roles.cache.find(role => role.id == r));
}

module.exports.remove_role = function remove_role(g, m, r) {
    g.members.cache.find(mem => mem.id == m).roles.remove(g.roles.cache.find(role => role.id == r));
}

module.exports.rm_arr_by_val = function rm_arr_by_val(a, v) {
    var pos = a.indexOf(v);
    a.splice(v, 1);
    return a;
}

module.exports.lerp = function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}