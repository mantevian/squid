module.exports.args_parse = function args_parse(text) {
    var args = { };
    const split_text = text.split(/[ ]+/);
    const args_count = split_text.length;

    for (var i = 0; i < args_count; i++) {
        let arg = split_text[i];
        if (arg.includes(`=`)) {
            let field = arg.split(`=`)[0];
            let value = arg.split(`=`)[1];
            if (parseInt(value, 10).toString() == value)
                value = parseInt(value);

            if (parseFloat(value).toString() == value)
                value = parseFloat(value);

            if (value == "true")
                value = true;
            
            if (value == "false")
                value = false;

            args[field] = value;
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