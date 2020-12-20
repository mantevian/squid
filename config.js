module.exports = {
    bot_owner_id: "240841342723424256",
    mante_tag: "Mante#6804",
    sputnix_tag: "SputNix#0001",
    bot_version: "0.3.0-b1",

    default_guild_config: {
        level_roles: null,
        levelup_message_adjectives: [
            {
                item: "epic",
                weight: 100
            },
            {
                item: "cool",
                weight: 100
            },
            {
                item: "amazing",
                weight: 100
            },
            {
                item: "awesome",
                weight: 100
            },
            {
                item: "fantastic",
                weight: 100
            },
            {
                item: "fabulous",
                weight: 80
            },
            {
                item: "legendary",
                weight: 80
            },
            {
                item: "incredible",
                weight: 80
            },
            {
                item: "marvelous",
                weight: 80
            },
            {
                item: "epic gamer",
                weight: 50
            },
            {
                item: "bloomy",
                weight: 50
            },
            {
                item: "glowy",
                weight: 50
            },
            {
                item: "squiddley",
                weight: 10
            },
            {
                item: "squiddley widdley",
                weight: 1
            }
        ],
        levelup_emoji: ":trophy:",
        new_role_emoji: ":crown:",
        levelup_message_enabled: true,
        use_beta_features: false,
        settings: {
            xp_enabled: false,
            xp_cooldown: 60000,
            xp_min: 8,
            xp_max: 16,
            new_role_message_enabled: true,
            hide_uncached_from_leaderboards: false,
            old_leveling: false
        }
    },

    squid_says: {
        fake_starts: [
            "Alright,",
            "Okay,",
            "Now,",
            "Squad says",
            "Squod says",
            "Squ!d says",
            "Please",
            "Glow Squid says",
            "Say squids"
        ],
        tasks: {
            say: [
                "hello",
                "hi",
                "boom",
                "beep boop",
                "i love this bot",
                "squid is cool",
                "glow squid",
                "pog",
                "iceologer",
                "moobloom"
            ],
            react: [
                "🤖",
                "👍",
                "🔥",
                "🤔",
                "🌊",
                "🌅",
                "❤️"
            ],
            status: [
                "online",
                "idle",
                "dnd",
                "offline"
            ]
        },
        opposite_day: false
    }
}