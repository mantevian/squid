const
    fs = require(`fs`),
    { RNG } = require(`../utils/seeded_random.js`),
    utils = require(`../utils/util_functions.js`),
    { promisify } = require(`util`),
    JSZip = require(`jszip`),
    zip = new JSZip(),
    SimplexNoise = require(`simplex-noise`),
    readdir = promisify(fs.readdir);

module.exports = {
    name: "datapack",
    enabled: true,
    permission_level: 0,
    description: "Generates a Minecraft Datapack based on command's arguments",
    usage: "<type> [config]",
    run: async (client, message, args) => {
        const config = utils.args_parse(message.content);

        zip.forEach(function (relative_path, file) {
            zip.remove(relative_path);
        });

        switch (config.type) {
            case `random_dimensions`:
                var seed = Math.floor(Math.random() * Math.pow(2, 31));
                var rng = new RNG(config.seed ? config.seed : seed);

                message.channel.send(`Generating the datapack...`);
                const defaults = {};
                const files = await readdir(`resources/worldgen_defaults`);

                for (var i = 0; i < files.length; i++)
                    defaults[files[i].slice(0, -5)] = JSON.parse(fs.readFileSync(`resources/worldgen_defaults/${files[i]}`, `utf8`));

                function get_random_stateless_block() {
                    return `minecraft:${utils.random_choice(defaults.stateless_block_list)}`;
                }

                for (var d = 0; d < config.dim_count ? config.dim_count : 5; d++) {
                    var dimension_type = {
                        has_raids: rng.next_float() < config.has_raids,
                        logical_height: 256,
                        infiniburn: utils.random_choice(["minecraft:infiniburn_overworld", "minecraft:infiniburn_nether", "minecraft:infiniburn_end"]),
                        ambient_light: Math.max(rng.next_int_ranged(0, 110) / 100 - 0.1, 1.0),
                        piglin_safe: rng.next_float() < config.piglin_safe,
                        bed_works: rng.next_float() < config.bed_works,
                        respawn_anchor_works: rng.next_float() < config.respawn_anchor_works,
                        ultrawarm: rng.next_float() < config.ultrawarm,
                        natural: rng.next_float() < config.natural,
                        coordinate_scale: rng.next_int_ranged(10, 999990) / 1000,
                        has_skylight: rng.next_float() < config.has_skylight,
                        has_ceiling: rng.next_float() < config.has_ceiling,
                        effects: utils.random_choice(["minecraft:overworld", "minecraft:the_nether", "minecraft:the_end"]),
                    }

                    var dimension = defaults.default_dimension;
                    dimension.generator.settings.default_block.Name = get_random_stateless_block();

                    if (!config.water_liquid_only)
                        switch (rng.next_int_ranged(0, 3)) {
                            case 0:
                                dimension.generator.settings.default_fluid.Name = get_random_stateless_block();
                                break;

                            case 1:
                                dimension.generator.settings.default_fluid.Name = `minecraft:lava`;
                                break;
                        }

                    if (config.lava_liquid_only)
                        dimension.generator.settings.default_fluid.Name = `minecraft:lava`

                    switch (config.bedrock_roof) {
                        case `no`:
                            dimension.generator.settings.bedrock_roof_position = -10;
                            break;
                        case `yes`:
                            dimension.generator.settings.bedrock_roof_position = rng.next_int_ranged(0, 10);
                            break;
                        default:
                            dimension.generator.settings.bedrock_roof_position = rng.next_int_ranged(-10, 2);
                            break;
                    }

                    switch (config.bedrock_floor) {
                        case `no`:
                            dimension.generator.settings.bedrock_floor_position = -10;
                            break;
                        case `yes`:
                            dimension.generator.settings.bedrock_floor_position = rng.next_int_ranged(0, 10);
                            break;
                        default:
                            dimension.generator.settings.bedrock_floor_position = rng.next_int_ranged(-10, 2);
                            break;
                    }

                    dimension.generator.settings.sea_level = rng.next_int_ranged(16, 128);

                    dimension.generator.settings.noise.height = rng.next_int_ranged(64, 256);
                    dimension.generator.settings.noise.size_horizontal = rng.next_int_ranged(1, 3);
                    dimension.generator.settings.noise.size_vertical = rng.next_int_ranged(1, 3);
                    dimension.generator.settings.noise.density_factor = rng.next_int_ranged(1, 2000) / 1000 - 1;
                    dimension.generator.settings.noise.density_offset = rng.next_int_ranged(1, 2000) / 1000 - 1;

                    dimension.generator.settings.noise.sampling.xz_factor = rng.next_int_ranged(1, 1000);
                    dimension.generator.settings.noise.sampling.y_factor = rng.next_int_ranged(1, 1000);
                    dimension.generator.settings.noise.sampling.xz_scale = rng.next_int_ranged(1, 1000) / 10;
                    dimension.generator.settings.noise.sampling.y_scale = rng.next_int_ranged(1, 1000) / 10;

                    dimension.generator.settings.noise.top_slide.target = rng.next_int_ranged(-1000, 1000);
                    dimension.generator.settings.noise.top_slide.size = rng.next_int_ranged(1, 64);
                    dimension.generator.settings.noise.top_slide.offset = rng.next_int_ranged(-1, 3);
                    dimension.generator.settings.noise.bottom_slide.target = rng.next_int_ranged(-1000, 1000);
                    dimension.generator.settings.noise.bottom_slide.size = rng.next_int_ranged(1, 64);
                    dimension.generator.settings.noise.bottom_slide.offset = rng.next_int_ranged(-1, 3);

                    dimension.type = `infdim:type_${d}`;

                    dimension.generator.biome_source.biomes = [];
                    for (var b = 0; b < config.biome_count ? config.biome_count : 5; b++) {
                        var biome = defaults.default_biome;
                        biome.scale = rng.next_int_ranged(1, 300) / 100;
                        biome.depth = rng.next_int_ranged(1, 200) / 100 - 1;
                        biome.temperature = rng.next_int_ranged(1, 200) / 100 - 1;
                        biome.downfall = rng.next_int_ranged(1, 200) / 100 - 1;
                        biome.effects.fog_color = rng.next_int_ranged(1, 16777215);
                        biome.effects.water_color = rng.next_int_ranged(1, 16777215);
                        biome.effects.water_fog_color = rng.next_int_ranged(1, 16777215);
                        biome.effects.sky_color = rng.next_int_ranged(1, 16777215);
                        biome.effects.foliage_color = rng.next_int_ranged(1, 16777215);
                        biome.effects.grass_color = rng.next_int_ranged(1, 16777215);

                        biome.player_spawn_friendly = rng.next_int_ranged(0, 2) > 0;

                        biome.category = utils.random_choice(defaults.biome_category_list);
                        biome.precipitation = utils.random_choice(defaults.biome_precipitation_list);

                        if (rng.next_int_ranged(0, 3) == 0) {
                            biome.surface_builder = {
                                config: {
                                    top_material: {
                                        Name: get_random_stateless_block()
                                    },
                                    under_material: {
                                        Name: get_random_stateless_block()
                                    },
                                    underwater_material: {
                                        Name: get_random_stateless_block()
                                    }
                                },
                                type: `minecraft:${utils.random_choice(defaults.surface_builder_type_list)}`
                            }
                        }
                        else
                            biome.surface_builder = `minecraft:${utils.random_choice(defaults.surface_builder_list)}`;

                        biome.features = [[], [], [], [], [], [], [], [], [], []];
                        biome.spawners = {
                            water_ambient: [],
                            ambient: [],
                            misc: [],
                            water_creature: [],
                            creature: [],
                            monster: []
                        };
                        biome.starts = [];
                        biome.carvers = {};

                        for (var f = 0; f < rng.next_int_ranged(1, 25); f++)
                            biome.features[rng.next_int_ranged(0, 10)].push(utils.random_choice(defaults.configured_feature_list));

                        for (var s = 0; s < rng.next_int_ranged(1, 25); s++) {
                            var mob = utils.random_choice(defaults.spawner_list);
                            var spawner_type;
                            switch (mob) {
                                case `bat`:
                                    spawner_type = `ambient`;
                                    break;

                                case `zombified_piglin`:
                                case `zombie_villager`:
                                case `zoglin`:
                                case `zombie`:
                                case `wither_skeleton`:
                                case `witch`:
                                case `vex`:
                                case `vindicator`:
                                case `stray`:
                                case `spider`:
                                case `slime`:
                                case `skeleton`:
                                case `silverfish`:
                                case `shulker`:
                                case `ravager`:
                                case `pillager`:
                                case `piglin`:
                                case `piglin_brute`:
                                case `phantom`:
                                case `magma_cube`:
                                case `illusioner`:
                                case `husk`:
                                case `hoglin`:
                                case `giant`:
                                case `ghast`:
                                case `evoker`:
                                case `endermite`:
                                case `enderman`:
                                case `creeper`:
                                case `cave_spider`:
                                case `blaze`:
                                    spawner_type = `monster`;
                                    break;

                                case `cod`:
                                case `salmon`:
                                case `pufferfish`:
                                case `tropical_fish`:
                                    spawner_type = `water_ambient`;
                                    break;

                                case `guardian`:
                                case `turtle`:
                                case `elder_guardian`:
                                case `drowned`:
                                case `squid`:
                                case `dolphin`:
                                    spawner_type = `water_creature`;
                                    break;

                                case `cow`:
                                case `zombie_horse`:
                                case `wolf`:
                                case `trader_llama`:
                                case `strider`:
                                case `skeleton_horse`:
                                case `sheep`:
                                case `pig`:
                                case `rabbit`:
                                case `panda`:
                                case `polar_bear`:
                                case `parrot`:
                                case `ocelot`:
                                case `mule`:
                                case `mooshroom`:
                                case `llama`:
                                case `horse`:
                                case `fox`:
                                case `donkey`:
                                case `chicken`:
                                case `cat`:
                                case `bee`:
                                    spawner_type = `creature`;
                                    break;

                                default:
                                    spawner_type = `misc`;
                            }

                            biome.spawners[spawner_type].push({
                                type: `minecraft:${mob}`,
                                weight: rng.next_int_ranged(1, 50),
                                minCount: rng.next_int_ranged(0, 2),
                                maxCount: rng.next_int_ranged(2, 5)
                            });
                        }

                        for (var s = 0; s < defaults.biome_starts_list.length; s++) {
                            if (rng.next_int_ranged(0, 2) == 1)
                                biome.starts.push(defaults.biome_starts_list[s]);
                        }

                        for (var c = 0; c < rng.next_int_ranged(1, 8); c++) {
                            var block = utils.random_choice([`air`, `liquid`]);
                            biome.carvers[`${block}`] = [];
                            for (var i = 0; i < defaults.biome_carver_list.length; i++) {
                                if (rng.next_int_ranged(0, 2) == 1)
                                    biome.carvers[`${block}`].push(defaults.biome_carver_list[i]);
                            }
                        }

                        zip.file(`data/infdim/worldgen/biome/biome_${d}_${b}.json`, JSON.stringify(biome));

                        dimension.generator.biome_source.biomes.push({
                            biome: `infdim:biome_${d}_${b}`,
                            parameters: {
                                altitude: rng.next_int_ranged(1, 2000) / 1000 - 1,
                                weirdness: rng.next_int_ranged(1, 2000) / 1000 - 1,
                                offset: rng.next_int_ranged(1, 1000) / 1000,
                                temperature: rng.next_int_ranged(1, 2000) / 1000 - 1,
                                humidity: rng.next_int_ranged(1, 2000) / 1000 - 1
                            }
                        });
                    }

                    zip.file(`data/infdim/dimension/dim_${d}.json`, JSON.stringify(dimension));
                    zip.file(`data/infdim/dimension_type/type_${d}.json`, JSON.stringify(dimension_type));
                }

                zip.file(`pack.mcmeta`, `{"pack":{"pack_format":6,"description":"Randomized dimensions for 1.16.3 developed by Mante#6804"}}`);

                zip
                    .generateNodeStream({ type: `nodebuffer`, streamFiles: true })
                    .pipe(fs.createWriteStream(`random_dimensions.zip`))
                    .on('finish', function () {
                        message.channel.send({
                            files: [{
                                attachment: `/app/random_dimensions.zip`,
                                name: `random_dimensions_${seed}_d${config.dim_count}b${config.biome_count}.zip`
                            }]
                        });
                    });
                break;

            case `dungeon_generator`:
                var seed = Math.floor(Math.random() * Math.pow(2, 31));
                var rng = new RNG(config.seed ? config.seed : seed);

                var temperature_seed = rng.next_int();
                var humidity_seed = rng.next_int();
                var altitude_seed = rng.next_int();
                var weirdness_seed = rng.next_int();
                var level_seed = rng.next_int();
                var replace_seed = rng.next_int();

                var temperature_scale = 20;
                var humidity_scale = 20;
                var altitude_scale = 20;
                var weirdness_scale = 20;
                var level_scale = 7;

                if (config.temperature_scale)
                    temperature_scale = config.temperature_scale;

                if (config.humidity_scale)
                    humidity_scale = config.humidity_scale;

                if (config.altitude_scale)
                    altitude_scale = config.altitude_scale;

                if (config.weirdness_scale)
                    weirdness_scale = config.weirdness_scale;

                if (config.level_scale)
                    level_scale = config.level_scale;

                var special_room_count = 7;
                if (config.special_room_count)
                    special_room_count = config.special_room_count;

                var special_room_distance = 5;
                if (config.special_room_distance)
                    special_room_distance = config.special_room_distance;

                const special_room_angle = 2 * Math.PI / special_room_count;

                var temperature_modifier = 0;
                var humidity_modifier = 0;
                var altitude_modifier = 0;
                var weirdness_modifier = 0;

                if (config.temperature_modifier)
                    temperature_modifier = config.temperature_modifier;

                if (config.humidity_modifier)
                    humidity_modifier = config.humidity_modifier;

                if (config.altitude_modifier)
                    altitude_modifier = config.altitude_modifier;

                if (config.weirdness_modifier)
                    weirdness_modifier = config.weirdness_modifier;

                var main_function = `gamerule doTileDrops false
gamerule randomTickSpeed 10
tag @s add rdg
tellraw @s { "color": "red", "bold": true, "text": "Please do not move until the generation is done!" }
            `;

                var functions = [];

                var room_count = 75;
                if (config.room_count)
                    room_count = config.room_count;

                var world_size = Math.floor(Math.sqrt(room_count) * 6 / Math.log(Math.sqrt(room_count / 8)));
                var level = 0;
                var door_chance = 0.1;
                if (config.door_chance)
                    door_chance = config.door_chance;

                var room_height = 5;
                var room_size = 13;
                var deco_room = 0;

                function shuffle(array) {
                    for (let i = array.length - 1; i > 0; i--) {
                        let j = Math.floor(rng.next_float() * (i + 1));
                        [array[i], array[j]] = [array[j], array[i]];
                    }
                }

                const temperature_noise = new SimplexNoise(temperature_seed);
                const humidity_noise = new SimplexNoise(humidity_seed);
                const altitude_noise = new SimplexNoise(altitude_seed);
                const weirdness_noise = new SimplexNoise(weirdness_seed);
                const level_noise = new SimplexNoise(level_seed);
                const replace_noise = new SimplexNoise(replace_seed);

                const biome_config = JSON.parse(fs.readFileSync(`./resources/dungeon_generator/biomes.json`));
                var biome_groups = biome_config.groups;
                shuffle(biome_groups);

                const decorations_config = JSON.parse(fs.readFileSync(`./resources/dungeon_generator/decorations.json`));
                const decorations = [];

                class Room {
                    constructor(x, z, biome) {
                        this.x = x;
                        this.z = z;

                        this.real_x = (x - Math.floor(world_size / 2)) * (room_size + 2);
                        this.real_z = (z - Math.floor(world_size / 2)) * (room_size + 2);
                        this.biome = biome;
                        this.level = level;

                        this.doors = [0, 0, 0, 0];
                    }
                }

                var rooms = [];
                var biomemap = [];
                var levelmap = [];

                rooms.length = world_size;
                biomemap.length = world_size;
                levelmap.length = world_size;

                function fill(deco_room, x1, y1, z1, x2, y2, z2, block, type) {
                    functions[deco_room] += `fill ~${x1} ~${y1} ~${z1} ~${x2} ~${y2} ~${z2} ${block}`;
                    if (type)
                        functions[deco_room] += ` ${type}`;

                    functions[deco_room] += `\n`;
                }

                function setblock(deco_room, x, y, z, block) {
                    functions[deco_room] += `setblock ~${x} ~${y} ~${z} ${block}\n`;
                }

                function if_block_fill_single(deco_room, qx, qy, qz, qblock, sx, sy, sz, sblock, sfrom) {
                    functions[deco_room] += `execute if block ~${qx} ~${qy} ~${qz} ${qblock} run fill ~${sx} ~${sy} ~${sz} ~${sx} ~${sy} ~${sz} ${sblock} replace ${sfrom}\n`
                }

                function biome_name(id) {
                    return biome_config.names[id];
                }

                function get_replace_noise_3d(x, y, z, scale, offset) {
                    return replace_noise.noise3D(x / scale + offset * 10, y / scale + offset * 100, z / scale + offset * 1000);
                }

                function get_replace_noise_2d(x, z, scale, offset) {
                    return replace_noise.noise2D(x / scale + offset * 10, z / scale + offset * 100);
                }

                // 0 = +x   1 = +z   2 = -x   3 = -z

                var half_room = Math.floor((room_size + 2) / 2);

                function choose_direction() {
                    return rng.next_int_ranged(0, 3);
                }

                var current_room_amount = 0;
                function random_door_size() {
                    return rng.next_int_ranged(1, Math.min(room_size, room_height) - 1);
                }

                async function start() {
                    zip.forEach(function (relative_path) {
                        zip.remove(relative_path);
                    });

                    zip.file(`data/minecraft/tags/function/load.json`, `{"values":["mante:load"]}`);
                    zip.file(`data/minecraft/tags/function/tick.json`, `{"values":["mante:tick"]}`);

                    zip.file(`pack.mcmeta`, `{"pack":{"pack_format":7,"description":"Randomized dungeons for 20w46a by Mante#6804"}}`);

                    zip.file(`data/mante/functions/load.mcfunction`, ``);
                    zip.file(`data/mante/functions/tick.mcfunction`, ``);
                    zip.folder(`data/mante/functions/generator`);

                    let tag_files = await readdir(`resources/dungeon_generator/tags`);
                    for (var i = 0; i < tag_files.length; i++)
                        zip.file(`data/mante/tags/blocks/${tag_files[i]}`, fs.readFileSync(`resources/dungeon_generator/tags/${tag_files[i]}`, `utf8`));

                    let loot_folders = await readdir(`resources/dungeon_generator/loot_tables`);
                    for (var i = 0; i < loot_folders.length; i++) {
                        let loot_files = await readdir(`resources/dungeon_generator/loot_tables/${loot_folders[i]}`);
                        for (var j = 0; j < loot_files.length; j++) {
                            zip.file(`data/mante/loot_tables/${loot_folders[i]}/${loot_files[j]}`, fs.readFileSync(`resources/dungeon_generator/loot_tables/${loot_folders[i]}/${loot_files[j]}`, `utf8`));
                        }
                    }

                    for (var i = 0; i < decorations_config.length; i++) {
                        var decoration = JSON.parse(fs.readFileSync(`resources/dungeon_generator/decorations/${decorations_config[i]}.json`, `utf8`));
                        for (var j = 0; j < decoration.length; j++)
                            decorations.push(decoration[j]);
                    }

                    for (var i = 0; i < world_size + 1; i++) {
                        rooms[i] = [];
                        rooms[i].length = world_size;
                        for (var j = 0; j < rooms[i].length; j++)
                            rooms[i][j] = null;

                        biomemap[i] = [];
                        biomemap[i].length = world_size;
                        for (var j = 0; j < biomemap[i].length; j++)
                            biomemap[i][j] = null;

                        levelmap[i] = [];
                        levelmap[i].length = world_size;
                        for (var j = 0; j < levelmap[i].length; j++)
                            levelmap[i][j] = Math.ceil((level_noise.noise2D(i / level_scale, j / level_scale) + 1) / 2 * 10);
                    }

                    for (var i = 0; i < world_size + 1; i++) {
                        for (var j = 0; j < world_size + 1; j++) {
                            var t = temperature_noise.noise2D(i / temperature_scale, j / temperature_scale) + temperature_modifier;
                            var h = humidity_noise.noise2D(i / humidity_scale, j / humidity_scale) + humidity_modifier;
                            var a = altitude_noise.noise2D(i / altitude_scale, j / altitude_scale) + altitude_modifier;
                            var w = weirdness_noise.noise2D(i / weirdness_scale, j / weirdness_scale) + weirdness_modifier;
                            var temperature_difference = 0;
                            var min_temperature_difference = 1;
                            var humidity_difference = 0;
                            var min_humidity_difference = 1;
                            var altitude_difference = 0;
                            var min_altitude_difference = 1;
                            var weirdness_difference = 0;
                            var min_weirdness_difference = 1;

                            for (var b = 0; b < biome_groups.length; b++) {
                                temperature_difference = Math.abs(biome_groups[b].temperature - t);
                                humidity_difference = Math.abs(biome_groups[b].humidity - h);
                                altitude_difference = Math.abs(biome_groups[b].altitude - a);
                                weirdness_difference = Math.abs(biome_groups[b].weirdness - w);

                                if (temperature_difference + humidity_difference + altitude_difference + weirdness_difference < min_temperature_difference + min_humidity_difference + min_altitude_difference + min_weirdness_difference)
                                    biomemap[i][j] = biome_groups[b].id;

                                if (temperature_difference < min_temperature_difference)
                                    min_temperature_difference = temperature_difference;

                                if (humidity_difference < min_humidity_difference)
                                    min_humidity_difference = humidity_difference;

                                if (altitude_difference < min_altitude_difference)
                                    min_altitude_difference = altitude_difference;

                                if (weirdness_difference < min_weirdness_difference)
                                    min_weirdness_difference = weirdness_difference;
                            }
                        }
                    }

                    for (var i = 0; i < world_size + 1; i++) {
                        for (var j = 0; j < world_size + 1; j++) {
                            if (config.fixed_biome)
                                biomemap[i][j] = config.fixed_biome;

                            if (levelmap[i][j] > 5)
                                biomemap[i][j]++;

                            if (levelmap[i][j] > 8)
                                biomemap[i][j]++;
                        }
                    }

                    var current_special_room_angle = 0;
                    for (var c = 0; c < special_room_count; c++) {
                        let x = Math.floor(Math.cos(current_special_room_angle) * special_room_distance + Math.floor(world_size / 2));
                        let y = Math.floor(Math.sin(current_special_room_angle) * special_room_distance + Math.floor(world_size / 2));
                        let n = Math.floor(biomemap[x][y] / 4) * 4;
                        if (biome_config.has_special_room[n])
                            biomemap[x][y] = n + 3;
                        current_special_room_angle += special_room_angle;
                    }

                    rooms[Math.floor(world_size / 2) + 1][Math.floor(world_size / 2) + 1] = new Room(Math.floor(world_size / 2) + 1, Math.floor(world_size / 2) + 1, biome_config.names[biomemap[Math.floor(world_size / 2) + 1][Math.floor(world_size / 2) + 1]]);

                    while (current_room_amount < room_count) {
                        for (var i = 0; i < world_size + 1; i++) {
                            for (var j = 0; j < world_size + 1; j++) {
                                if (rooms[i][j] == null)
                                    continue;

                                var direction = choose_direction();

                                switch (direction) {
                                    case 0:
                                        if (rooms[i + 1][j] == null) {
                                            rooms[i + 1][j] = new Room(i + 1, j, biome_config.names[biomemap[i + 1][j]]);
                                            current_room_amount++;
                                            rooms[i + 1][j].doors[2] = random_door_size();
                                            rooms[i][j].doors[0] = random_door_size();
                                        }
                                        else if (rng.next_float() < door_chance) {
                                            rooms[i + 1][j].doors[2] = random_door_size();
                                            rooms[i][j].doors[0] = random_door_size();
                                        }
                                        break;

                                    case 1:
                                        if (rooms[i][j + 1] == null) {
                                            rooms[i][j + 1] = new Room(i, j + 1, biome_config.names[biomemap[i][j + 1]]);
                                            current_room_amount++;
                                            rooms[i][j].doors[1] = random_door_size();
                                            rooms[i][j + 1].doors[3] = random_door_size();
                                        }
                                        else if (rng.next_float() < door_chance) {
                                            rooms[i][j].doors[1] = random_door_size();
                                            rooms[i][j + 1].doors[3] = random_door_size();
                                        }
                                        break;

                                    case 2:
                                        if (rooms[i - 1][j] == null) {
                                            rooms[i - 1][j] = new Room(i - 1, j, biome_config.names[biomemap[i - 1][j]]);
                                            current_room_amount++;
                                            rooms[i][j].doors[2] = random_door_size();
                                            rooms[i - 1][j].doors[0] = random_door_size();
                                        }
                                        else if (rng.next_float() < door_chance) {
                                            rooms[i][j].doors[2] = random_door_size();
                                            rooms[i - 1][j].doors[0] = random_door_size();
                                        }
                                        break;

                                    case 3:
                                        if (rooms[i][j - 1] == null) {
                                            rooms[i][j - 1] = new Room(i, j - 1, biome_config.names[biomemap[i][j - 1]]);
                                            current_room_amount++;
                                            rooms[i][j].doors[3] = random_door_size();
                                            rooms[i][j - 1].doors[1] = random_door_size();
                                        }
                                        else if (rng.next_float() < door_chance) {
                                            rooms[i][j].doors[3] = random_door_size();
                                            rooms[i][j - 1].doors[1] = random_door_size();
                                        }
                                        break;
                                }
                            }
                        }
                    }

                    functions.length = current_room_amount;
                    for (var i = 0; i < functions.length; i++)
                        functions[i] = ``;

                    for (var i = 0; i < world_size + 1; i++) {
                        for (var j = 0; j < world_size + 1; j++) {
                            if (rooms[i][j] == null)
                                continue;

                            var rx = rooms[i][j].real_x;
                            var rz = rooms[i][j].real_z;

                            fill(deco_room, rx - half_room, -4, rz - half_room, rx + half_room, room_height + 6, rz + half_room, biome_config.blocks[`${rooms[i][j].biome}`]);
                            fill(deco_room, rx - half_room - 1, -5, rz - half_room - 1, rx + half_room + 1, room_height + 7, rz + half_room + 1, `bedrock replace air`);
                            fill(deco_room, rx - half_room + 2, 1 - biome_config.extend_height[biomemap[i][j]].floor, rz - half_room + 2, rx + half_room - 2, room_height + biome_config.extend_height[biomemap[i][j]].ceiling, rz + half_room - 2, `air`);
                            if (biome_config.fill_water[biomemap[i][j]])
                                fill(deco_room, rx - half_room + 2, -1, rz - half_room + 2, rx + half_room - 2, room_height + 2, rz + half_room - 2, `water`);

                            if (biome_config.sky[biomemap[i][j]]) {
                                fill(deco_room, rx - half_room + 2, room_height + 6, rz - half_room + 2, rx + half_room - 2, room_height + 6, rz + half_room - 2, `light_blue_terracotta`);
                            }

                            fill(deco_room, rx - half_room, room_height + 8, rz - half_room, rx + half_room, room_height + 8, rz + half_room, `black_concrete`);
                            fill(deco_room, rx - half_room + 1, room_height + 9, rz - half_room + 1, rx + half_room - 1, room_height + 9, rz + half_room - 1, biome_config.blocks[`${rooms[i][j].biome}`]);

                            deco_room++;
                        }
                    }

                    deco_room = 0;

                    for (var i = 0; i < world_size + 1; i++) {
                        for (var j = 0; j < world_size + 1; j++) {
                            if (rooms[i][j] == null)
                                continue;

                            var rx = rooms[i][j].real_x;
                            var rz = rooms[i][j].real_z;

                            var bottom = 1;
                            if (biomemap[i][j] == 16 || biomemap[i][j] == 17)
                                bottom = 0;

                            if (rooms[i + 1][j] != null)
                                if (rooms[i][j].doors[0] > 0 && rooms[i + 1][j].doors[2] > 0) {
                                    if (biome_config.min_door_size[biomemap[i][j]] == 2 || biome_config.min_door_size[biomemap[i + 1][j]] == 2)
                                        fill(deco_room, rx + half_room + 2, bottom, rz - 1, rx + half_room - 2, 3, rz + 1, `air`, `replace #mante:door_removeable`);

                                    fill(deco_room, rx + half_room + 4, 2, rz - 1, rx + half_room - 4, 3, rz + 1, `air`, `replace #mante:probably_obtrusive`);

                                    fill(deco_room, rx + half_room + 2, bottom, rz - Math.min(rooms[i][j].doors[0], rooms[i + 1][j].doors[2]) + 1, rx + half_room - 2, 1 + Math.min(rooms[i][j].doors[0], rooms[i + 1][j].doors[2]), rz + Math.min(rooms[i][j].doors[0], rooms[i + 1][j].doors[2]) - 1, `air`, `replace #mante:door_removeable`);
                                    fill(deco_room, rx + half_room + 3, 1, rz - Math.min(rooms[i][j].doors[0], rooms[i + 1][j].doors[2]) + 1, rx + half_room - 3, 1 + Math.min(rooms[i][j].doors[0], rooms[i + 1][j].doors[2]), rz + Math.min(rooms[i][j].doors[0], rooms[i + 1][j].doors[2]) - 1, `air`, `replace #mante:door_removeable`);

                                    fill(deco_room, rx + half_room + 1, room_height + 9, rz + 1, rx + half_room - 1, room_height + 9, rz - 1, biome_config.blocks[`${rooms[i][j].biome}`]);
                                }
                            if (rooms[i][j + 1] != null)
                                if (rooms[i][j].doors[1] > 0 && rooms[i][j + 1].doors[3] > 0) {
                                    if (biome_config.min_door_size[biomemap[i][j]] == 2 || biome_config.min_door_size[biomemap[i][j + 1]] == 2)
                                        fill(deco_room, rx - 1, bottom, rz + half_room + 2, rx + 1, 3, rz + half_room - 2, `air`, `replace #mante:door_removeable`);

                                    fill(deco_room, rx - 1, 2, rz + half_room + 4, rx + 1, 3, rz + half_room - 4, `air`, `replace #mante:probably_obtrusive`);

                                    fill(deco_room, rx - Math.min(rooms[i][j].doors[1], rooms[i][j + 1].doors[3]) + 1, bottom, rz + half_room + 2, rx + Math.min(rooms[i][j].doors[1], rooms[i][j + 1].doors[3]) - 1, 1 + Math.min(rooms[i][j].doors[1], rooms[i][j + 1].doors[3]), rz + half_room - 1, `air`, `replace #mante:door_removeable`);
                                    fill(deco_room, rx - Math.min(rooms[i][j].doors[1], rooms[i][j + 1].doors[3]) + 1, 1, rz + half_room + 3, rx + Math.min(rooms[i][j].doors[1], rooms[i][j + 1].doors[3]) - 1, 1 + Math.min(rooms[i][j].doors[1], rooms[i][j + 1].doors[3]), rz + half_room - 3, `air`, `replace #mante:door_removeable`);

                                    fill(deco_room, rx - 1, room_height + 9, rz + half_room + 1, rx + 1, room_height + 9, rz + half_room - 1, biome_config.blocks[`${rooms[i][j].biome}`]);
                                }
                            if (rooms[i - 1][j] != null)
                                if (rooms[i][j].doors[2] > 0 && rooms[i - 1][j].doors[0] > 0) {
                                    if (biome_config.min_door_size[biomemap[i][j]] == 2 || biome_config.min_door_size[biomemap[i - 1][j]] == 2)
                                        fill(deco_room, rx - half_room + 2, bottom, rz - 1, rx - half_room - 2, 3, rz + 1, `air`, `replace #mante:door_removeable`);

                                    fill(deco_room, rx - half_room + 4, 2, rz - 1, rx - half_room - 4, 3, rz + 1, `air`, `replace #mante:probably_obtrusive`);

                                    fill(deco_room, rx - half_room - 2, bottom, rz - Math.min(rooms[i][j].doors[2], rooms[i - 1][j].doors[0]) + 1, rx - half_room - 1, 1 + Math.min(rooms[i][j].doors[2], rooms[i - 1][j].doors[0]), rz + Math.min(rooms[i][j].doors[2], rooms[i - 1][j].doors[0]) - 1, `air`, `replace #mante:door_removeable`);
                                    fill(deco_room, rx - half_room - 3, 1, rz - Math.min(rooms[i][j].doors[2], rooms[i - 1][j].doors[0]) + 1, rx - half_room + 3, 1 + Math.min(rooms[i][j].doors[2], rooms[i - 1][j].doors[0]), rz + Math.min(rooms[i][j].doors[2], rooms[i - 1][j].doors[0]) - 1, `air`, `replace #mante:door_removeable`);

                                    fill(deco_room, rx - half_room - 1, room_height + 9, rz - 1, rx - half_room + 1, room_height + 9, rz + 1, biome_config.blocks[`${rooms[i][j].biome}`]);
                                }
                            if (rooms[i][j - 1] != null)
                                if (rooms[i][j].doors[3] > 0 && rooms[i][j - 1].doors[1] > 0) {
                                    if (biome_config.min_door_size[biomemap[i][j]] == 2 || biome_config.min_door_size[biomemap[i][j - 1]] == 2)
                                        fill(deco_room, rx - 1, bottom, rz - half_room - 2, rx + 1, 3, rz - half_room + 2, `air`, `replace #mante:door_removeable`);

                                    fill(deco_room, rx - 1, 2, rz - half_room - 4, rx + 1, 3, rz - half_room + 4, `air`, `replace #mante:probably_obtrusive`);

                                    fill(deco_room, rx - Math.min(rooms[i][j].doors[3], rooms[i][j - 1].doors[1]) + 1, bottom, rz - half_room - 2, rx + Math.min(rooms[i][j].doors[3], rooms[i][j - 1].doors[1]) - 1, 1 + Math.min(rooms[i][j].doors[3], rooms[i][j - 1].doors[1]), rz - half_room - 1, `air`, `replace #mante:door_removeable`);
                                    fill(deco_room, rx - Math.min(rooms[i][j].doors[3], rooms[i][j - 1].doors[1]) + 1, 1, rz - half_room + 3, rx + Math.min(rooms[i][j].doors[3], rooms[i][j - 1].doors[1]) - 1, 1 + Math.min(rooms[i][j].doors[3], rooms[i][j - 1].doors[1]), rz - half_room - 3, `air`, `replace #mante:door_removeable`);

                                    fill(deco_room, rx - 1, room_height + 9, rz - half_room - 1, rx + 1, room_height + 9, rz - half_room + 1, biome_config.blocks[`${rooms[i][j].biome}`]);
                                }
                            deco_room++;
                        }
                    }

                    deco_room = 0;

                    for (var i = 0; i < world_size + 1; i++) {
                        for (var j = 0; j < world_size + 1; j++) {
                            if (rooms[i][j] == null)
                                continue;

                            var rx = rooms[i][j].real_x;
                            var rz = rooms[i][j].real_z;

                            for (var d = 0; d < decorations.length; d++) {
                                var deco = decorations[d];

                                if (deco.biome)
                                    if (deco.biome != biome_name(biomemap[i][j]))
                                        continue;

                                if (deco.biomes)
                                    if (!deco.biomes.includes(biome_name(biomemap[i][j])))
                                        continue;

                                var count = 1;
                                var room_volume = (room_height + 2) * room_size * room_size;
                                var sign = rng.next_int_ranged(0, 1);
                                var passed_conditions = true;

                                if (deco.count)
                                    if (typeof deco.count == `object`)
                                        count = rng.next_int_ranged(deco.count.min, deco.count.max);
                                    else if (typeof deco.count == `number`)
                                        count = deco.count;

                                if (deco.chance)
                                    if (rng.next_float() > deco.chance)
                                        passed_conditions = false;

                                if (deco.amount)
                                    if (typeof deco.amount == `object`)
                                        count = rng.next_int_ranged(room_volume * deco.amount.min, room_volume * deco.amount.max);
                                    else if (typeof deco.amount == `number`)
                                        count = room_volume * deco.amount;

                                if (deco.amount_horizontal)
                                    if (typeof deco.amount_horizontal == `object`)
                                        count = rng.next_int_ranged(room_size * deco.amount_horizontal.min, room_size * deco.amount_horizontal.max);
                                    else if (typeof deco.amount_horizontal == `number`)
                                        count = room_size * deco.amount;

                                if (deco.amount_vertical)
                                    if (typeof deco.amount_vertical == `object`)
                                        count = rng.next_int_ranged(room_height * deco.amount_vertical.min, room_height * deco.amount_vertical.max);
                                    else if (typeof deco.amount_vertical == `number`)
                                        count = room_height * deco.amount;

                                if (deco.room_height) {
                                    if (deco.room_height.min)
                                        if (deco.room_height.min > room_height)
                                            passed_conditions = false;

                                    if (deco.room_height.max)
                                        if (deco.room_height.max < room_height)
                                            passed_conditions = false;
                                }

                                if (deco.door_size)
                                    for (var door = 0; door < 4; door++) {

                                        if (typeof deco.door_size[door] == `number`) {
                                            if (rooms[i][j].doors[door] != deco.door_size[door])
                                                passed_conditions = false;
                                        }

                                        else if (typeof deco.door_size[door] == `object`) {
                                            if (deco.door_size[door].min)
                                                if (rooms[i][j].doors[door] < deco.door_size[door].min)
                                                    passed_conditions = false;

                                            if (deco.door_size[door].max)
                                                if (rooms[i][j].doors[door] > deco.door_size[door].max)
                                                    passed_conditions = false;
                                        }
                                    }

                                if (!passed_conditions)
                                    continue;

                                for (var c = 0; c < count; c++)
                                    switch (deco.type) {
                                        case `floor`:
                                            if (deco.ceiling)
                                                fill(deco_room, rx - half_room, room_height + 1, rz - half_room, rx + half_room, room_height + 1, rz + half_room, deco.block);
                                            else
                                                fill(deco_room, rx - half_room, 0, rz - half_room, rx + half_room, 0, rz + half_room, deco.block);
                                            break;

                                        case `fill_layer`:
                                            for (var bx = -(half_room - deco.walls_margin); bx <= half_room - deco.walls_margin; bx++)
                                                for (var bz = -(half_room - deco.walls_margin); bz <= half_room - deco.walls_margin; bz++) {
                                                    passed_conditions = true;
                                                    if (deco.noise) {
                                                        if (deco.noise.min)
                                                            if (get_replace_noise_2d(rx + bx, rz + bz, deco.noise.scale, deco.noise.offset) < deco.noise.min)
                                                                passed_conditions = false;

                                                        if (deco.noise.max)
                                                            if (get_replace_noise_2d(rx + bx, rz + bz, deco.noise.scale, deco.noise.offset) > deco.noise.max)
                                                                passed_conditions = false;
                                                    }
                                                    if (passed_conditions) {
                                                        if (deco.block)
                                                            setblock(deco_room, rx + bx, deco.y, rz + bz, deco.block);
                                                        if (deco.from && deco.to)
                                                            fill(deco_room, rx + bx, deco.y, rz + bz, rx + bx, deco.y, rz + bz, deco.to, `replace ${deco.from}`);
                                                    }
                                                }
                                            break;

                                        case `random_patch`:
                                            var bx = rx + rng.next_int_ranged(-(half_room - 2), half_room - 2);
                                            var bz = rz + rng.next_int_ranged(-(half_room - 2), half_room - 2);

                                            passed_conditions = true;
                                            if (deco.noise) {
                                                if (deco.noise.min)
                                                    if (get_replace_noise_2d(bx, bz, deco.noise.scale, deco.noise.offset) < deco.noise.min)
                                                        passed_conditions = false;

                                                if (deco.noise.max)
                                                    if (get_replace_noise_2d(bx, bz, deco.noise.scale, deco.noise.offset) > deco.noise.max)
                                                        passed_conditions = false;
                                            }

                                            if (passed_conditions) {
                                                if (!deco.from) {
                                                    if (deco.block)
                                                        setblock(deco_room, bx, deco.y, bz, deco.block);
                                                    else if (deco.blocks)
                                                        setblock(deco_room, bx, deco.y, bz, rng.choice(deco.blocks));
                                                }
                                                else {
                                                    if (deco.block)
                                                        fill(deco_room, bx, deco.y, bz, bx, deco.y, bz, deco.block, `replace ${deco.from}`);
                                                    else if (deco.blocks)
                                                        fill(deco_room, bx, deco.y, bz, bx, deco.y, bz, rng.choice(deco.blocks), `replace ${deco.from}`);
                                                }
                                            }
                                            break;

                                        case `column`:
                                            var bx = rx + rng.next_int_ranged(-half_room + 2, half_room - 2);
                                            var bz = rz + rng.next_int_ranged(-half_room + 2, half_room - 2);

                                            for (var b = deco.blocks.length - 1; b >= 0; b--) {
                                                var by = deco.blocks[b].y;

                                                if (deco.blocks[b].from == `ceiling`)
                                                    setblock(deco_room, bx, room_height - by + 1, bz, deco.blocks[b].block);
                                                else if (deco.blocks[b].from == `floor`)
                                                    setblock(deco_room, bx, by, bz, deco.blocks[b].block);
                                            }
                                            break;

                                        case `line`:
                                            var lx = rng.next_int_ranged(-half_room, half_room);
                                            var ly = rng.next_int_ranged(0, room_height + 1);
                                            var lz = rng.next_int_ranged(-half_room, half_room);
                                            if (deco.x != undefined) {
                                                if (typeof deco.x == `number`)
                                                    lx = deco.x;
                                                else if (typeof deco.x == `object`)
                                                    lx = rng.next_int_ranged(-half_room + deco.x.min, half_room - deco.x.max);
                                            }

                                            if (deco.y != undefined) {
                                                if (typeof deco.y == `number`)
                                                    ly = deco.y;
                                                else if (typeof deco.y == `object`)
                                                    ly = rng.next_int_ranged(deco.y.min, room_height + 1 - deco.y.max);
                                            }

                                            if (deco.z != undefined) {
                                                if (typeof deco.z == `number`)
                                                    lz = deco.z;
                                                else if (typeof deco.z == `object`)
                                                    lz = rng.next_int_ranged(-half_room + deco.z.min, half_room - deco.z.max);
                                            }

                                            switch (deco.axis) {
                                                case `x`:
                                                    for (var bx = -half_room; bx <= half_room; bx++) {
                                                        var passed_local_conditions = true;
                                                        if (deco.chance_each)
                                                            if (rng.next_float() > deco.chance_each)
                                                                passed_local_conditions = false;

                                                        if (deco.x != undefined)
                                                            if (bx > half_room - deco.x.max || bx < -(half_room - deco.x.min))
                                                                passed_local_conditions = false;

                                                        if (deco.noise) {
                                                            if (deco.noise.min)
                                                                if (get_replace_noise_3d(rx + bx, ly, rz + lz, deco.noise.scale, deco.noise.offset) < deco.noise.min)
                                                                    passed_local_conditions = false;

                                                            if (deco.noise.max)
                                                                if (get_replace_noise_3d(rx + bx, ly, rz + lz, deco.noise.scale, deco.noise.offset) > deco.noise.max)
                                                                    passed_local_conditions = false;
                                                        }
                                                        if (passed_conditions && passed_local_conditions)
                                                            fill(deco_room, rx + bx, ly, rz + lz, rx + bx, ly, rz + lz, deco.to, `replace ${deco.from}`);
                                                    }
                                                    break;

                                                case `y`:
                                                    for (var by = -2; by < room_height + 3; by++) {
                                                        var passed_local_conditions = true;
                                                        if (deco.chance_each)
                                                            if (rng.next_float() > deco.chance_each)
                                                                passed_local_conditions = false;

                                                        if (deco.y != undefined)
                                                            if (by > deco.y.max || by < deco.y.min)
                                                                passed_local_conditions = false;

                                                        if (deco.noise) {
                                                            if (deco.noise.min)
                                                                if (get_replace_noise_3d(rx + lx, by, rz + lz, deco.noise.scale, deco.noise.offset) < deco.noise.min)
                                                                    passed_local_conditions = false;

                                                            if (deco.noise.max)
                                                                if (get_replace_noise_3d(rx + lx, by, rz + lz, deco.noise.scale, deco.noise.offset) > deco.noise.max)
                                                                    passed_local_conditions = false;
                                                        }
                                                        if (passed_conditions && passed_local_conditions)
                                                            fill(deco_room, rx + lx, by, rz + lz, rx + lx, by, rz + lz, deco.to, `replace ${deco.from}`);
                                                    }
                                                    break;

                                                case `z`:
                                                    for (var bz = -half_room; bz <= half_room; bz++) {
                                                        var passed_local_conditions = true;
                                                        if (deco.chance_each)
                                                            if (rng.next_float() > deco.chance_each)
                                                                passed_local_conditions = false;

                                                        if (deco.z != undefined)
                                                            if (bz > half_room - deco.z.max || bz < -(half_room - deco.z.min))
                                                                passed_local_conditions = false;

                                                        if (deco.noise) {
                                                            if (deco.noise.min)
                                                                if (get_replace_noise_3d(rx + lx, ly, rz + bz, deco.noise.scale, deco.noise.offset) < deco.noise.min)
                                                                    passed_local_conditions = false;

                                                            if (deco.noise.max)
                                                                if (get_replace_noise_3d(rx + lx, ly, rz + bz, deco.noise.scale, deco.noise.offset) > deco.noise.max)
                                                                    passed_local_conditions = false;
                                                        }
                                                        if (passed_conditions && passed_local_conditions)
                                                            fill(deco_room, rx + lx, ly, rz + bz, rx + lx, ly, rz + bz, deco.to, `replace ${deco.from}`);
                                                    }
                                                    break;
                                            }
                                            break;

                                        case `fixed_lines`:
                                            for (var l = 0; l < deco.lines.length; l++) {
                                                if (deco.axis == `x`) {
                                                    if (deco.lines[l].from)
                                                        fill(deco_room, rx - half_room, deco.y, rz + deco.lines[l].z, rx + half_room, deco.y, rz + deco.lines[l].z, deco.lines[l].to, `replace ${deco.lines[l].from}`);
                                                    else
                                                        fill(deco_room, rx - half_room, deco.y, rz + deco.lines[l].z, rx + half_room, deco.y, rz + deco.lines[l].z, deco.lines[l].to);
                                                }

                                                if (deco.axis == `z`) {
                                                    if (deco.lines[l].from)
                                                        fill(deco_room, rx + deco.lines[l].x, deco.y, rz - half_room, rx + deco.lines[l].x, deco.y, rz + half_room, deco.lines[l].to, `replace ${deco.lines[l].from}`);
                                                    else
                                                        fill(deco_room, rx + deco.lines[l].x, deco.y, rz - half_room, rx + deco.lines[l].x, deco.y, rz + half_room, deco.lines[l].to);
                                                }
                                            }
                                            break;

                                        case `replace_randomly`:
                                            var bx = rx + rng.next_int_ranged(-half_room, half_room);
                                            var by = rng.next_int_ranged(0, room_height + 4);
                                            var bz = rz + rng.next_int_ranged(-half_room, half_room);
                                            passed_conditions = true;
                                            if (deco.noise) {
                                                if (deco.noise.min)
                                                    if (get_replace_noise_3d(bx, by, bz, deco.noise.scale, deco.noise.offset) < deco.noise.min)
                                                        passed_conditions = false;

                                                if (deco.noise.max)
                                                    if (get_replace_noise_3d(bx, by, bz, deco.noise.scale, deco.noise.offset) > deco.noise.max)
                                                        passed_conditions = false;
                                            }

                                            if (passed_conditions) {
                                                if (deco.place) {
                                                    if (deco.place.above)
                                                        if_block_fill_single(deco_room, bx, by - 1, bz, deco.place.above, bx, by, bz, deco.to, deco.from);

                                                    if (deco.place.below)
                                                        if_block_fill_single(deco_room, bx, by + 1, bz, deco.place.below, bx, by, bz, deco.to, deco.from);

                                                    if (deco.place.north)
                                                        if_block_fill_single(deco_room, bx, by, bz - 1, deco.place.north, bx, by, bz, deco.to, deco.from);

                                                    if (deco.place.east)
                                                        if_block_fill_single(deco_room, bx + 1, by, bz, deco.place.east, bx, by, bz, deco.to, deco.from);

                                                    if (deco.place.south)
                                                        if_block_fill_single(deco_room, bx, by, bz + 1, deco.place.south, bx, by, bz, deco.to, deco.from);

                                                    if (deco.place.west)
                                                        if_block_fill_single(deco_room, bx - 1, by, bz, deco.place.west, bx, by, bz, deco.to, deco.from);
                                                }
                                                else
                                                    fill(deco_room, bx, by, bz, bx, by, bz, deco.to, `replace ${deco.from}`);
                                            }

                                            break;

                                        case `replace_all`:
                                            for (var bx = -half_room; bx <= half_room; bx++)
                                                for (var by = -1; by <= room_height + 4; by++)
                                                    for (var bz = -half_room; bz <= half_room; bz++) {
                                                        var passed_local_conditions = true;

                                                        if (deco.each_chance)
                                                            if (rng.next_float() > deco.each_chance)
                                                                continue;

                                                        if (deco.x != undefined) {
                                                            if (typeof deco.x == `number`)
                                                                if (bx != deco.x)
                                                                    passed_local_conditions = false;

                                                            if (typeof deco.x == `object`) {
                                                                if (deco.x.min)
                                                                    if (bx < deco.x.min)
                                                                        passed_local_conditions = false;

                                                                if (deco.x.max)
                                                                    if (bx > deco.x.max)
                                                                        passed_local_conditions = false;
                                                            }
                                                        }

                                                        if (deco.y != undefined) {
                                                            if (typeof deco.y == `number`)
                                                                if (by != deco.y)
                                                                    passed_local_conditions = false;

                                                            if (typeof deco.y == `object`) {
                                                                if (deco.y.min)
                                                                    if (by < deco.y.min)
                                                                        passed_local_conditions = false;

                                                                if (deco.y.max)
                                                                    if (by > deco.y.max)
                                                                        passed_local_conditions = false;
                                                            }
                                                        }

                                                        if (deco.z != undefined) {
                                                            if (typeof deco.z == `number`)
                                                                if (bz != deco.z)
                                                                    passed_local_conditions = false;

                                                            if (typeof deco.z == `object`) {
                                                                if (deco.z.min)
                                                                    if (bz < deco.z.min)
                                                                        passed_local_conditions = false;

                                                                if (deco.z.max)
                                                                    if (bz > deco.z.max)
                                                                        passed_local_conditions = false;
                                                            }
                                                        }

                                                        if (deco.noise) {
                                                            if (deco.noise.min)
                                                                if (get_replace_noise_3d(rx + bx, by, rz + bz, deco.noise.scale, deco.noise.offset) < deco.noise.min)
                                                                    passed_local_conditions = false;

                                                            if (deco.noise.max)
                                                                if (get_replace_noise_3d(rx + bx, by, rz + bz, deco.noise.scale, deco.noise.offset) > deco.noise.max)
                                                                    passed_local_conditions = false;
                                                        }

                                                        if (passed_conditions && passed_local_conditions) {
                                                            if (deco.place) {
                                                                if (deco.place.above)
                                                                    if_block_fill_single(deco_room, rx + bx, by - 1, rz + bz, deco.place.above, rx + bx, by, rz + bz, deco.to, deco.from);

                                                                if (deco.place.below)
                                                                    if_block_fill_single(deco_room, rx + bx, by + 1, rz + bz, deco.place.below, rx + bx, by, rz + bz, deco.to, deco.from);

                                                                if (deco.place.north)
                                                                    if_block_fill_single(deco_room, rx + bx, by, rz + bz - 1, deco.place.north, rx + bx, by, rz + bz, deco.to, deco.from);

                                                                if (deco.place.east)
                                                                    if_block_fill_single(deco_room, rx + bx + 1, by, rz + bz, deco.place.east, rx + bx, by, rz + bz, deco.to, deco.from);

                                                                if (deco.place.south)
                                                                    if_block_fill_single(deco_room, rx + bx, by, rz + bz + 1, deco.place.south, rx + bx, by, rz + bz, deco.to, deco.from);

                                                                if (deco.place.west)
                                                                    if_block_fill_single(deco_room, rx + bx - 1, by, rz + bz, deco.place.west, rx + bx, by, rz + bz, deco.to, deco.from);
                                                            }
                                                            else
                                                                fill(deco_room, rx + bx, by, rz + bz, rx + bx, by, rz + bz, deco.to, `replace ${deco.from}`);
                                                        }
                                                    }
                                            break;

                                        case `fixed`:
                                            var s = rng.next_int_ranged(0, deco.structures.length - 1);
                                            var n = -1;
                                            if (deco.choose)
                                                if (deco.choose == true)
                                                    n = rng.next_int_ranged(0, deco.structures[s].length - 1);

                                            for (var b = 0; b < deco.structures[s].length; b++) {
                                                if (n != -1)
                                                    if (b != n)
                                                        continue;

                                                var bx, by, bz,
                                                    bx1, bx2, by1, by2, bz1, bz2;

                                                var block = deco.structures[s][b];
                                                var chosen_block;
                                                if (block.block)
                                                    chosen_block = block.block;
                                                if (block.blocks)
                                                    chosen_block = rng.choice(block.blocks);

                                                if (rng.next_float() > block.chance)
                                                    continue;

                                                if (block.position) {
                                                    bx = rx + block.position.x;
                                                    by = block.position.y;
                                                    bz = rz + block.position.z;
                                                }
                                                else if (block.choose_position) {
                                                    var bn = rng.next_int_ranged(0, block.choose_position.length - 1);
                                                    bx = rx + block.choose_position[bn].x;
                                                    by = block.choose_position[bn].y;
                                                    bz = rz + block.choose_position[bn].z;
                                                }
                                                else if (block.choose_block) {
                                                    var bn = rng.next_int_ranged(0, block.choose_block.length - 1);
                                                    bx = rx + block.choose_block[bn].x;
                                                    by = block.choose_block[bn].y;
                                                    bz = rz + block.choose_block[bn].z;
                                                    chosen_block = block.choose_block[bn].block;
                                                }
                                                else if (block.start && block.end) {
                                                    bx1 = rx + block.start.x;
                                                    by1 = block.start.y;
                                                    bz1 = rz + block.start.z;
                                                    bx2 = rx + block.end.x;
                                                    by2 = block.end.y;
                                                    bz2 = rz + block.end.z;
                                                }

                                                var passed_local_conditions = true;

                                                if (block.door_size)
                                                    for (var door = 0; door < 4; door++) {
                                                        if (typeof block.door_size[door] == `number`) {
                                                            if (rooms[i][j].doors[door] != block.door_size[door].min)
                                                                passed_local_conditions = false;
                                                        }

                                                        else if (typeof block.door_size[door] == `object`) {
                                                            if (block.door_size[door].min)
                                                                if (rooms[i][j].doors[door] < block.door_size[door].min)
                                                                    passed_local_conditions = false;

                                                            if (block.door_size[door].max)
                                                                if (rooms[i][j].doors[door] > block.door_size[door].max)
                                                                    passed_local_conditions = false;
                                                        }
                                                    }

                                                if (block.position)
                                                    if (deco.noise) {
                                                        if (deco.noise.min)
                                                            if (get_replace_noise_3d(bx, by, bz) < deco.noise.min)
                                                                passed_local_conditions = false;

                                                        if (deco.noise.max)
                                                            if (get_replace_noise_3d(bx, by, bz) > deco.noise.max)
                                                                passed_local_conditions = false;
                                                    }

                                                if (block.position)
                                                    if (deco.relative) {
                                                        if (deco.relative.x) {
                                                            if (deco.relative.x == `+`)
                                                                bx = rx + half_room - block.position.x - 2;

                                                            if (deco.relative.x == `-`)
                                                                bx = rx - (half_room - block.position.x - 2);

                                                            if (deco.relative.x == `+-`)
                                                                if (sign == 0)
                                                                    bx = rx + half_room - block.position.x - 2;
                                                                else
                                                                    bx = rx - (half_room - block.position.x - 2);
                                                        }

                                                        if (deco.relative.y)
                                                            if (deco.relative.y == `+`)
                                                                by = room_height - block.position.y + 1;

                                                        if (deco.relative.z) {
                                                            if (deco.relative.z == `+`)
                                                                bz = rz + half_room - block.position.z - 2;

                                                            if (deco.relative.z == `-`)
                                                                bz = rz - (half_room - block.position.z - 2);

                                                            if (deco.relative.z == `+-`)
                                                                if (sign == 0)
                                                                    bz = rz + half_room - block.position.z - 2;
                                                                else
                                                                    bz = rz - (half_room - block.position.z - 2);
                                                        }
                                                    }

                                                if (block.relative) {
                                                    if (block.relative.x) {
                                                        if (block.relative.x == `+`)
                                                            bx = rx + half_room - block.position.x - 2;

                                                        if (block.relative.x == `-`)
                                                            bx = rx - (half_room - block.position.x - 2);

                                                        if (block.relative.x == `+-`)
                                                            if (rng.next_int_ranged(0, 1) == 0)
                                                                bx = rx + half_room - block.position.x - 2;
                                                            else
                                                                bx = rx - (half_room - block.position.x - 2);
                                                    }

                                                    if (block.relative.y)
                                                        if (block.relative.y == `+`)
                                                            by = room_height - by + 1;

                                                    if (block.relative.z) {
                                                        if (block.relative.z == `+`)
                                                            bz = rz + half_room - block.position.z - 2;

                                                        if (block.relative.z == `-`)
                                                            bz = rz - (half_room - block.position.z - 2);

                                                        if (block.relative.z == `+-`)
                                                            if (rng.next_int_ranged(0, 1) == 0)
                                                                bz = rz + half_room - block.position.z - 2;
                                                            else
                                                                bz = rz - (half_room - block.position.z - 2);
                                                    }
                                                }

                                                if (passed_conditions && passed_local_conditions) {
                                                    if (block.position || block.choose_position || block.choose_block)
                                                        if (block.replace)
                                                            fill(deco_room, bx, by, bz, bx, by, bz, chosen_block, `replace ${block.replace}`);
                                                        else
                                                            setblock(deco_room, bx, by, bz, chosen_block);
                                                    else if (block.start && block.end)
                                                        fill(deco_room, bx1, by1, bz1, bx2, by2, bz2, chosen_block);
                                                }
                                            }

                                            break;
                                        case `vein`:
                                            var startx = rng.next_int_ranged(-half_room + 2, half_room - 2);
                                            var startz = rng.next_int_ranged(-half_room + 2, half_room - 2);

                                            for (var br = 0; br < rng.next_int_ranged(deco.branches.min, deco.branches.max); br++) {
                                                var ah = Math.asin(rng.next_float() * 2 - 1);
                                                var av = Math.asin(rng.next_float() * 2 - 1);
                                                var bx = startx;
                                                var bz = startz;
                                                var by = deco.y;
                                                for (var b = 0; b < rng.next_int_ranged(deco.size.min, deco.size.max); b++) {
                                                    bx += Math.sin(ah);
                                                    bz += Math.cos(ah);
                                                    by += Math.sin(av);
                                                    if (Math.abs(bx) > Math.abs(half_room - 2) || Math.abs(bz) > Math.abs(half_room - 2) || by < -1 || by > room_height + 2) { }
                                                    else fill(deco_room, Math.floor(rx + bx), Math.floor(by), Math.floor(rz + bz), Math.floor(rx + bx), Math.floor(by), Math.floor(rz + bz), deco.to, `replace ${deco.from}`);
                                                }
                                            }
                                            break;

                                        case `surface_noise`:
                                            for (var bx = -half_room; bx <= half_room; bx++)
                                                for (var bz = -half_room; bz <= half_room; bz++) {
                                                    var by = Math.floor(Math.abs(get_replace_noise_2d(rx + bx, rz + bz, deco.scale, deco.offset)) * deco.size) + deco.block_offset;
                                                    var passed_local_conditions = true;
                                                    if (deco.chance_each)
                                                        if (rng.next_float() > deco.chance_each)
                                                            passed_local_conditions = false;

                                                    if (deco.noise) {
                                                        if (deco.noise.min)
                                                            if (get_replace_noise_3d(rx + bx, by, rz + bz) < deco.noise.min)
                                                                passed_local_conditions = false;

                                                        if (deco.noise.max)
                                                            if (get_replace_noise_3d(rx + bx, by, rz + bz) > deco.noise.max)
                                                                passed_local_conditions = false;
                                                    }

                                                    if (by < deco.min_y || by < -2 || by > room_height + 5)
                                                        passed_local_conditions = false;

                                                    if (passed_local_conditions)
                                                        fill(deco_room, rx + bx, Math.max(by - rng.next_int_ranged(deco.height.min, deco.height.max), -3), rz + bz, rx + bx, by, rz + bz, deco.to, `replace ${deco.from}`);
                                                }
                                            break;

                                        case `tree`:
                                            var max_x = -half_room + 3;
                                            var max_y = 1;
                                            var max_z = -half_room + 3;
                                            var max_noise = -1;
                                            var sy = rng.next_int_ranged(3, room_height - deco.max_height);

                                            for (var bx = -half_room + 4; bx <= half_room - 4; bx++)
                                                for (var by = sy - 2; by <= sy + 2; by++)
                                                    for (var bz = -half_room + 4; bz <= half_room - 4; bz++) {
                                                        var noise = get_replace_noise_3d(rx + bx, by, rz + bz, deco.noise.scale, deco.noise.offset);

                                                        if (noise > max_noise) {
                                                            max_noise = noise;
                                                            max_x = bx;
                                                            max_y = by;
                                                            max_z = bz;
                                                        }
                                                    }

                                            if (deco.leaves_type == `noise`)
                                                for (var bx = -half_room + 1; bx <= half_room - 1; bx++)
                                                    for (var by = 0; by <= room_height + 2 - deco.max_height; by++)
                                                        for (var bz = -half_room + 1; bz <= half_room - 1; bz++) {
                                                            var noise = get_replace_noise_3d(rx + bx, by, rz + bz, deco.noise.scale, deco.noise.offset);

                                                            if (noise > max_noise - rng.next_float_ranged(deco.leaves_size.min, deco.leaves_size.max) && noise > deco.allowed_noise.min && noise < deco.allowed_noise.max)
                                                                setblock(deco_room, rx + bx, by, rz + bz, deco.leaves);
                                                        }

                                            for (var by = 0; by <= max_y; by++)
                                                fill(deco_room, rx + max_x + rng.next_int_ranged(0, deco.width), by, rz + max_z + rng.next_int_ranged(0, deco.width), rx + max_x + rng.next_int_ranged(0, deco.width), by, rz + max_z + rng.next_int_ranged(0, deco.width), deco.trunk);

                                            if (deco.leaves_type == `vein`) {
                                                for (var br = 0; br < rng.next_int_ranged(deco.branches.min, deco.branches.max); br++) {
                                                    var ah = Math.asin(rng.next_float() * 2 - 1);
                                                    var av = Math.asin(rng.next_float() * 2 - 1);
                                                    var bx = max_x;
                                                    var bz = max_z;
                                                    var by = max_y;
                                                    for (var b = 0; b < rng.next_int_ranged(deco.size.min, deco.size.max); b++) {
                                                        bx += Math.sin(ah);
                                                        bz += Math.cos(ah);
                                                        by += Math.sin(av);
                                                        if (Math.abs(bx) > Math.abs(half_room - 2) || Math.abs(bz) > Math.abs(half_room - 2) || by < -1 || by > room_height + 2 - deco.max_height) { }
                                                        else fill(deco_room, Math.floor(rx + bx), Math.floor(by), Math.floor(rz + bz), Math.floor(rx + bx), Math.floor(by), Math.floor(rz + bz), deco.leaves, `replace air`);
                                                    }
                                                }
                                            }
                                            break;
                                    }
                            }
                            deco_room++;
                        }
                    }

                    finish();
                }

                function finish() {
                    var d = 0;
                    for (var i = 0; i < world_size; i++)
                        for (var j = 0; j < world_size; j++) {
                            if (rooms[i][j] == null)
                                continue;

                            zip.file(`data/mante/functions/rooms/${d}.mcfunction`, functions[d]);

                            main_function += `schedule function mante:generator/${d} ${(d + 1) * 2} append\n`;

                            zip.file(`data/mante/functions/generator/${d}.mcfunction`, `execute at @e[tag=rdg] run function mante:rooms/${d}
                        tellraw @a [ { "color": "green", "text": "Room #${d + 1}: " }, { "color": "gray", "text": "x=${rooms[i][j].x}, z=${rooms[i][j].z}, biome=${biome_name(biomemap[i][j])}, level=${levelmap[i][j]}" }, {"text":" [click to teleport]","italic":true,"color": "white", "clickEvent":{"action":"run_command","value":"/tp @s ~${rooms[i][j].real_x} ~ ~${rooms[i][j].real_z}"},"hoverEvent":{"action":"show_text","value":{"text":"","extra":[{"text":"Teleport to Room #${d + 1} at ${rooms[i][j].real_x} ~ ${rooms[i][j].real_z}"}]}}}]`);
                            d++;
                        }

                    main_function += `schedule function mante:done ${(functions.length + 1) * 2} append`

                    zip.file(`data/mante/functions/build.mcfunction`, main_function);
                    zip.file(`data/mante/functions/done.mcfunction`,
                        `execute as @e[tag=rdg] run tag @s remove rdg
tellraw @a [ { "color": "green", "bold": true, "text": "Done! You can move now. " }, { "color": "gray", "bold": false, "text": "Seed: ${seed}, room count: ${current_room_amount}/${room_count}, room size: ${room_size}x${room_size}x${room_height}, world size: ${world_size}" } ]`)

                    zip
                        .generateNodeStream({ type: `nodebuffer`, streamFiles: true })
                        .pipe(fs.createWriteStream(`dungeons.zip`))
                        .on('finish', function () {
                            message.channel.send({
                                files: [{
                                    attachment: `/app/dungeons.zip`,
                                    name: `dungeons_${seed}_r${room_count}.zip`
                                }]
                            });
                        });
                }

                start();
                break;

            case `bingo`:
                var seed = Math.floor(Math.random() * Math.pow(2, 31));
                var rng = new RNG(config.seed ? config.seed : seed);

                zip.file(`pack.mcmeta`, `{"pack":{"pack_format":6,"description":"Bingo generator by Mante"}}`);

                zip.folder(`data`);
                zip.folder(`data/bingo`);
                zip.folder(`data/bingo/functions`);
                zip.folder(`data/bingo/advancements`);
                zip.folder(`data/minecraft`);
                zip.folder(`data/minecraft/tags`);
                zip.folder(`data/minecraft/tags/functions`);

                zip.file(`data/bingo/advancements/root.json`, `{"display": {"title": {"text": "Bingo"},"description": {"text": "See the items you need to get here","color": "gold"},"icon": {"item": "minecraft:book"},"frame": "task","show_toast": true,"announce_to_chat": false,"hidden": false,"background": "minecraft:textures/block/bricks.png"},"criteria": {"impossible": {"trigger": "minecraft:impossible"}}}`)

                let function_files = await readdir(`resources/bingo/functions`);

                for (let i = 0; i < function_files.length; i++)
                    zip.file(`data/bingo/functions/${function_files[i]}`, fs.readFileSync(`resources/bingo/functions/${function_files[i]}`));

                zip.file(`data/minecraft/tags/functions/load.json`, `{"values": ["bingo:load"]}`);
                zip.file(`data/minecraft/tags/functions/tick.json`, `{"values": ["bingo:tick"]}`);

                let config_difficulty = 2;
                if (config.difficulty)
                    config_difficulty = config.difficulty;

                const params = [
                    { item: `default`, weight: config.default ? config.default : 15 },
                    { item: `nether`, weight: config.nether ? config.nether : 5 },
                    { item: `silk_touch`, weight: config.silk_touch ? config.silk_touch : 1 },
                    { item: `rare`, weight: config.rare ? config.rare : 0 },
                    { item: `ocean_monument`, weight: config.ocean_monument ? config.ocean_monument : 1 }
                ];

                const items = JSON.parse(fs.readFileSync(`resources/bingo/items.json`));

                items.default[0] = Object.entries(items.default[0]);
                items.default[1] = Object.entries(items.default[1]);
                items.default[2] = Object.entries(items.default[2]);
                items.default[3] = Object.entries(items.default[3]);
                items.default[4] = Object.entries(items.default[4]);
                items.nether[0] = Object.entries(items.nether[0]);
                items.nether[1] = Object.entries(items.nether[1]);
                items.nether[2] = Object.entries(items.nether[2]);
                items.nether[3] = Object.entries(items.nether[3]);
                items.nether[4] = Object.entries(items.nether[4]);
                items.silk_touch[4] = Object.entries(items.silk_touch[4]);
                items.end[4] = Object.entries(items.end[4]);
                items.rare[4] = Object.entries(items.rare[4]);
                items.ocean_monument[4] = Object.entries(items.ocean_monument[4]);

                var picked_items = [];
                let difficulties = [0, 0, 0, 0, 0];

                const default_advancement = JSON.parse(fs.readFileSync(`resources/bingo/default_advancement.json`));

                while (difficulties[2] < config_difficulty * 3 
                    && difficulties[3] < config_difficulty * 2
                    && difficulties[4] < config_difficulty) {
                    difficulties = [0, 0, 0, 0, 0];
                    for (var y = 0; y < 5; y++) {
                        for (var x = 0; x < 6; x++) {
                            let advancement = default_advancement;

                            if (x == 5) {
                                advancement =
                                {
                                    criteria: {
                                        impossible: {
                                            trigger: `minecraft:impossible`
                                        }
                                    },
                                    parent: `bingo:4_${y}`
                                };
                                zip.file(`data/bingo/advancements/${x}_${y}.json`, JSON.stringify(advancement));
                                continue;
                            }

                            let category = rng.weighted_random(params);

                            let difficulty = rng.next_int_ranged(0, 4)

                            if (category == `nether`)
                                if (difficulty == 0)
                                    difficulty = 1;

                            if (category != `default` && category != `nether`)
                                difficulty = 4;

                            let item = rng.choice(items[category][difficulty]);

                            while (picked_items.includes(item[1]))
                                item = rng.choice(items[category][difficulty]);

                            picked_items[y * 5 + x] = item[1];
                            difficulties[difficulty]++;

                            advancement.display.title.text = item[1];
                            advancement.display.description.text = `Obtain ${item[1]}. Reward: ${difficulty + 3} points`;
                            advancement.display.icon.item = item[0];

                            switch (difficulty) {
                                case 0:
                                case 1:
                                case 2:
                                    advancement.display.frame = `task`;
                                    break;

                                case 3:
                                    advancement.display.frame = `goal`;
                                    break;

                                case 4:
                                    advancement.display.frame = `challenge`;
                                    break;
                            }

                            advancement.criteria.item.conditions.items[0].item = item[0];
                            advancement.rewards.function = `bingo:add_score_${difficulty + 3}`;
                            advancement.parent = `bingo:${x - 1}_${y}`;
                            if (x == 0)
                                advancement.parent = `bingo:root`;

                            zip.file(`data/bingo/advancements/${x}_${y}.json`, JSON.stringify(advancement));
                        }
                    }
                }

                zip
                    .generateNodeStream({ type: `nodebuffer`, streamFiles: true })
                    .pipe(fs.createWriteStream(`bingo.zip`))
                    .on('finish', function () {
                        message.channel.send({
                            files: [{
                                attachment: `/app/bingo.zip`,
                                name: `bingo_${seed}.zip`
                            }]
                        });
                    });
                break;
            default:
                message.reply(`No such datapack type available.`);
                return;
        }
    }
}