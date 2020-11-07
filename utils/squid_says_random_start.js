module.exports = function (guild_id, config) {
    let choice = get_random_int(3);

    if (choice != 0) {
        return ({
            string: 'Squid says',
            real: config.opposite_day ? false : true
        })
    }

    return ({
        string: config.fake_starts[get_random_int(config.fake_starts.length)],
        real: config.opposite_day ? true : false
    });
}

function get_random_int(max) {
    return Math.floor(Math.random() * Math.floor(max));
}