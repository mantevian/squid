const firebase = require(`firebase-admin`);
const config = require(`../config.js`);

const service_account = {
    type: "service_account",
    project_id: "manteex-bots",
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: JSON.parse(process.env.FIREBASE_PRIVATE_KEY),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL
}

const firebase_config = {
    credential: firebase.credential.cert(service_account),
    databaseURL: "https://manteex-bots.firebaseio.com"
};

const app = firebase.initializeApp(firebase_config);

const database = firebase.database();

module.exports.db = app.database();

module.exports.create_guild = function create_guild(guild_id) {
    database.ref(`guild_config/${guild_id}`).set({
        level_roles: null,
        levelup_message_adjectives: config.default_levelup_adjectives,
        levelup_emoji: config.default_levelup_emoji,
        levelup_message_enabled: true,
        settings: {
            xp_enabled: config.default_xp_enabled,
            xp_cooldown: config.default_xp_cooldown,
            xp_min: config.default_xp_min,
            xp_max: config.default_xp_max,
            new_role_message_enabled: true,
            new_role_emoji: config.default_new_role_emoji,
            use_beta_features: false,
            hide_uncached_from_leaderboards: false,
            old_leveling: false,
        }
    });
}

module.exports.get_guild_config = function get_guild_config(guild_id) {
    return database.ref(`/guild_config/${guild_id}`).once(`value`);
}

module.exports.get_guild_config_value = function get_guild_config_value(guild_id, key) {
    return database.ref(`/guild_config/${guild_id}/${key}`).once(`value`);
}

module.exports.set_guild_config = function set_guild_config(guild_id, new_config) {
    database.ref(`guild_config/${guild_id}`).set(new_config);
}

module.exports.set_guild_config_value = function set_guild_config_value(guild_id, key, value) {
    database.ref(`guild_config/${guild_id}/${key}`).set(value);
}

module.exports.create_collar_user = function create_collar_user(user_id) {
    database.ref(`guild_stats/${config.collar_guild_id}/${user_id}`).set({
        points: 0,
        ideas_implemented: 0,
        badges: [
            `impossible`
        ]
    });
}

module.exports.create_squid_user = function create_squid_user(guild_id, user_id) {
    database.ref(`guild_stats/${guild_id}/${user_id}`).set({
        xp: 0,
        level: 0,
        last_xp_message_timestamp: 0
    });
}

module.exports.get_user_data = async function get_user_data(guild_id, user_id) {
    return database.ref(`/guild_stats/${guild_id}/${user_id}/`).once(`value`);
}

module.exports.get_user_value = async function get_user_value(guild_id, user_id, key) {
    return database.ref(`/guild_stats/${guild_id}/${user_id}/${key}`).once(`value`);
}

module.exports.get_collar_user_value = function get_collar_user_value(user_id, key) {
    this.get_user_value(config.collar_guild_id, user_id, key);
}

module.exports.set_user = function set_user(guild_id, user_id, new_data) {
    database.ref(`guild_stats/${guild_id}/${user_id}`).set(new_data);
}

module.exports.set_collar_user = function set_collar_user(user_id, new_data) {
    this.set_user(config.collar_guild_id, user_id, new_data);
}

module.exports.set_user_value = function set_user_value(guild_id, user_id, key, value) {
    database.ref(`guild_stats/${guild_id}/${user_id}/${key}`).set(value);
}

module.exports.set_collar_user_value = function set_collar_user_value(user_id, key, value) {
    this.set_user_value(config.collar_guild_id, user_id, key, value);
}

module.exports.set_squid_rank = function set_squid_rank(guild_id, user_id, xp, level) {
    this.set_user_value(guild_id, user_id, `xp`, xp);
    this.set_user_value(guild_id, user_id, `level`, level);
}

module.exports.increment_stats_length = async function increment_stats_length(guild_id) {
    var current_members = (await this.get_guild_config_value(guild_id, `stats_length`)).val();
    this.set_guild_config_value(guild_id, `stats_length`, current_members + 1);
}