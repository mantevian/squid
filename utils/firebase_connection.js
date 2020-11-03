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
    database.ref(`guild_config/${guild_id}`).set(config.default_guild_config);
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

module.exports.create_user = function create_user(guild_id, user_id) {
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

module.exports.set_user = function set_user(guild_id, user_id, new_data) {
    database.ref(`guild_stats/${guild_id}/${user_id}`).set(new_data);
}

module.exports.set_user_value = function set_user_value(guild_id, user_id, key, value) {
    database.ref(`guild_stats/${guild_id}/${user_id}/${key}`).set(value);
}

module.exports.set_rank = function set_rank(guild_id, user_id, xp, level) {
    this.set_user_value(guild_id, user_id, `xp`, xp);
    this.set_user_value(guild_id, user_id, `level`, level);
}

module.exports.increment_stats_length = async function increment_stats_length(guild_id) {
    var current_members = (await this.get_guild_config_value(guild_id, `stats_length`)).val();
    this.set_guild_config_value(guild_id, `stats_length`, current_members + 1);
}