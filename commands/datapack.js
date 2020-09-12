const
    fs = require(`fs`),
    { RNG } = require(`../../utils/random.js`),
    utils = require(`../../utils/util_functions.js`),
    { promisify } = require(`util`),
    JSZip = require(`jszip`),
    zip = new JSZip(),
    readdir = promisify(fs.readdir);

module.exports = {
    name: "datapack",
    enabled: true,
    permission_level: 0,
    beta: false,
    description: "Generates a Minecraft Datapack based on command's arguments",
    usage: "<type> [config]",
    run: async (client, message, args) => {
        const config = utils.args_parse(message.content);

        var seed = Math.floor(Math.random() * Math.pow(2, 31));

        if (config.seed)
            seed = config.seed;

        const rng = new RNG(seed);

        zip.forEach(function (relative_path, file) {
            zip.remove(relative_path);
        });

        switch (config.type) {
            case `random_dimensions`:
                message.channel.send(`Generating the datapack...`);
                const defaults = {};
                const files = await readdir(`resources/worldgen_defaults`);

                for (var i = 0; i < files.length; i++)
                    defaults[files[i].slice(0, -5)] = JSON.parse(fs.readFileSync(`resources/worldgen_defaults/${files[i]}`, `utf8`));

                function get_random_stateless_block() {
                    return `minecraft:${utils.random_string_array(defaults.stateless_block_list)}`;
                }

                for (var d = 0; d < config.dim_count; d++) {
                    var dimension_type = {
                        has_raids: rng.next_int_ranged(0, 2) > 0,
                        logical_height: 256,
                        infiniburn: utils.random_string_array(["minecraft:infiniburn_overworld", "minecraft:infiniburn_nether", "minecraft:infiniburn_end"]),
                        ambient_light: Math.max(rng.next_int_ranged(0, 110) / 100 - 0.1, 1.0),
                        piglin_safe: rng.next_int_ranged(0, 2) > 0,
                        bed_works: rng.next_int_ranged(0, 2) > 0,
                        respawn_anchor_works: rng.next_int_ranged(0, 2) > 0,
                        ultrawarm: rng.next_int_ranged(0, 2) > 0,
                        natural: rng.next_int_ranged(0, 2) > 0,
                        coordinate_scale: rng.next_int_ranged(10, 999990) / 1000,
                        has_skylight: rng.next_int_ranged(0, 2) > 1,
                        has_ceiling: rng.next_int_ranged(0, 2) > 1,
                        effects: utils.random_string_array(["minecraft:overworld", "minecraft:the_nether", "minecraft:the_end"]),
                    }

                    var dimension = defaults.default_dimension;
                    dimension.generator.settings.default_block.Name = get_random_stateless_block();

                    switch (rng.next_int_ranged(0, 3)) {
                        case 0:
                            dimension.generator.settings.default_fluid.Name = get_random_stateless_block();
                            break;

                        case 1:
                            dimension.generator.settings.default_fluid.Name = `minecraft:lava`;
                            break;
                    }
                        

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
                    for (var b = 0; b < config.biome_count; b++) {
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

                        biome.category = utils.random_string_array(defaults.biome_category_list);
                        biome.precipitation = utils.random_string_array(defaults.biome_precipitation_list);

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
                                type: `minecraft:${utils.random_string_array(defaults.surface_builder_type_list)}`
                            }
                        }
                        else
                            biome.surface_builder = `minecraft:${utils.random_string_array(defaults.surface_builder_list)}`;

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
                            biome.features[rng.next_int_ranged(0, 10)].push(utils.random_string_array(defaults.configured_feature_list));

                        for (var s = 0; s < rng.next_int_ranged(1, 25); s++) {
                            var mob = utils.random_string_array(defaults.spawner_list);
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
                            var block = utils.random_string_array([`air`, `liquid`]);
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

                zip.file(`pack.mcmeta`, `{"pack":{"pack_format":6,"description":"Randomized dimensions for 1.16.2 developed by Mante#6804"}}`);

                zip
                    .generateNodeStream({ type: `nodebuffer`, streamFiles: true })
                    .pipe(fs.createWriteStream(`random_dimensions.zip`))
                    .on('finish', function () {
                        message.channel.send({
                            files: [{
                                attachment: `/app/random_dimensions.zip`,
                                name: `random_dimensions_${seed}_d${config.dim_count}b${config.biome_count}.zip`
                            }]
                        })
                    });
                break;

            default:
                message.reply(`No such datapack type available.`);
                return;
        }
    }
}