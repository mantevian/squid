# Squid
Initially made for my friends' private server, but I'm slowly making it more public. It's a small general purpose bot with a very few unique features.
Prefix: `s/`, but `s!` is allowed since apparently `s/` can be used to edit a previous message's content.

## General
### Permission Levels
Each command has a permission level assigned to it, restricting its usage from members that aren't supposed to use it.
* 0 - Everyone
* 1 - Server Mods (Manage Messages permission)
* 2 - Server Admins (Manage Server permission)
* 3 - Server Owner
* 4 - Bot Developer

### Command argument syntax
Some commands use straight default syntax where all arguments go in a specific order: `s/command <arg1> <arg2> ...`, these arguments are listed in `<>` if they are necessary and `[]` if optional.
Arguments are listed as `<args*>` if they use a different syntax: `item=value` for numbers or single word strings, or `item="Hello World"` for multiple word strings. This is used for complex commands and a list of possible items is always provided in the documentation. Integers and boolean (`false`, `true`) values are properly converted from strings.

### Message triggers
The message trigger system allows making complex custom commands and actions for the bot. Server owners can create message triggers for their servers. A trigger activates whenever a message is sent and if a message passes its requirements, its actions are performed in a specific configurable order. A list of all possible values for this are listed below under **Reference**.

For example, we have a trigger called `ping_pong` that is supposed to reply "Pong!" to every message that contains "ping" in it and put a reaction on that message. This trigger would need a single requirement, with the type of `message_content` and 2 actions: `send_message` and `react_message`.
The action order system allows things such as making a role mentionable, sending a message mentioning it and then setting it unmentionable.

## Commands
> config
* Permission Level: 3
* Used to set the bot's configuration for a specific server.
* Usage:
  * `config view` - shows all server configurations,
  * `config view <item>` - shows a specific item's value,
  * `config set <args*>` - change server config.
* Examples:
  * `config view xp_cooldown` shows what's the XP cooldown on this server,
  * `config set xp_min=10 xp_max=20` sets XP given per message to between 10 and 20.

> datapack
* Permission Level: 0
* Generates Minecraft datapacks.
* Usage: `datapack <args*>`
* Example:
  * `datapack type=random_dimensions dim_count=10 biome_count=10`
  
> eval
* Permission Level: 4
* Executes a JavaScript code from the command.
* Usage: `eval <code>`

> help
* Permission Level: 0
* Shows help text.

> leaderboard
* Permission Level: 0
* Shows server's XP leaderboard.
* Usage: `leaderboard <page>`
* Example: `leaderboard 3`

> level_roles
* Permission Level: 3
* Sets/views server's roles given for reaching XP levels.
* Usage:
  * `level_roles view` - shows all level roles,
  * `level_roles set <level> <role name>` - sets a level role. `remove` can be used as a name to remove a role from the list.
* Example: `level_roles set 10 Squidder` - makes the bot give the role "Squidder" to everyone with level 10 or above.

> ping
* Permission Level: 0
* Checks the bot's response time.

> rank
* Permission Level: 0
* Checks someone's XP rank. Enabling `custom` will not show a fancy picture, but instead will show all the custom statistics.
* Usage: `rank [user_id=...] [custom=true|false]`
* Examples:
  * `rank`
  * `rank custom=true`
  * `rank user_id=240841342723424256`
  * `rank user_id=240841342723424256 custom=true`

> scoreboard
* Permission Level: 3
* Used to manipulate custom statistics for the server.
* Usage: `stats create|update|remove [stat_name, display_name] OR members add|remove|set [user_id, stat_name=amount ...]`
* Examples:
  * `scoreboard create stat_name=points display_name="Server Points"`
  * `scoreboard update stat_name=points display_name="Better Server Points"`
  * `scoreboard members set user_id=240841342723424256 points=20 xp=12345`
  
> trigger
* Permission Level: 3
* Configures server's message triggers.
* Usage:
  * `trigger create <trigger name> <text channel ID>` - adds a trigger to the server. By default only works in the specific channel entered in the command (use `-1` as text channel ID to enable it in all channels),
  * `trigger remove <trigger name>` - removes a trigger from the server,
  * `trigger add_requirement <trigger name> <order> <args*>` - adds a requirement for this trigger,
  * `trigger add_action <trigger name> <order> <args*>` - adds an action for this trigger.
* Examples:
  * `trigger create ping_pong 123456789` - creates a trigger called `ping_pong` in the channel `<#123456789>`,
  * `trigger add_requirement ping_pong 0 requirement=message_content text=ping case_sensitive=0 message_content_includes=0` - adds a requirement of the type `message_content` that looks for messages that exactly match the string `ping` (case insensitive),
  * `trigger add_action ping_pong 0 action=send_message text="Pong!"` - replies with `Pong!` to all messages that pass the requirements, aka which are "ping".
  
> vc
* Permission Level: 0
* Manages the bot's voice status in the server.
* Usage:
  * `vc join <voice channel name>` - joins a voice channel,
  * `vc leave` - leaves any voice channel in the server,
  * `vc play <YouTube link> <voice channel name>` - plays a YouTube audio in a voice channel.
  
## Reference
### Datapacks
> random_dimensions
* Generates a datapack consisting of multiple dimensions, each consisting of multiple unique biomes.
* Arguments:
  * `dim_count` - how many dimensions to generate,
  * `biome_count` - how many biomes to generate in each dimension,
  * `bedrock_roof` - if a bedrock roof should be present in the dimensions. `yes` to always generate roofs, `no` to never generate them and can be omitted to have worlds both with and without a roof,
  * `bedrock_floor` - same but for the floor,
  * `water_liquid_only` - all worlds have water as the liquid block,
  * `lava_liquid_only` - all worlds have lava as the liquid block, both water and lava settings should be omitted to enable random blocks as liquids,
  * Float values between 0 and 1 (0 means never, 1 means always) that determine a chance for various global world settings to be applied to a single dimension:
    * `has_raids` - enables Pillager raids,
    * `piglin_safe` - keeps Piglins and Hoglins without transforming them into zombified variants (`1` for keeping safe),
    * `bed_works` - makes beds work or explode (`0` for always exploding),
    * `respawn_anchor_works` - makes respawn anchors work or explode,
    * `ultrawarm` - makes lava flow for 8 blocks and water evaporate,
    * `natural` - makes compasses and clocks spin around randomly (`0` for always unnatural) or Zombified Piglins to be spawned from nether portals (natural),
    * `has_skylight` - whether a world has light coming from the sky,
    * `has_ceiling` - whether a world has a bedrock ceiling.

### Message trigger requirements
> author_has_role
* Passes if whoever sent a message has a specific role.
* Arguments:
  * `role_id` - the role's ID,
  * `inverted` - if true, passes if the message author does not have the role.
  
> author_stats
* Checks message author's server stats.
* Arguments:
  * `stat_name` - the name of the scoreboard statistic,
  * `value` - the value to compare with,
  * `operation` - can be one of these: `<`, `<=`, `>`, `>=`, `=`, `!=`. Compares message author's stat with the argument `value`.

> chance
* Makes the requirement succeed or fail based on a random chance.
* Arguments:
  * `chance` - a float number between 0 and 1 representing the chance for the requirement to succeed. For example, `0.5` means 50% chance, `0.3333334` is approximately 1 in 3.
  
> compare_messages_content
* Fetches a message and compares its content with this message's content.
* Arguments:
  * `compared_channel_id` - ID of a text channel to fetch a message in. `-1` for the same channel as this message's,
  * `compared_message_id` - ID of a message to compare with. If negative, uses a message that's `compared_message_id` messages before this one,
  * `compare_type` - can be either `number` or `lexicographical` (for reference use https://en.wikipedia.org/wiki/Lexicographical_order),
  * `compare_operation` - can be one of these: `<`, `<=`, `>`, `>=`, `=`, `!=`.
  
> content_is_number
* Passes if the whole message can be converted to a decimal number.
* Arguments:
  * `inverted` - if true, passes only when the message is not a number,
  * `min` - minimum number needed for this requirement,
  * `max` - maximum number.
  
> message_content
* Checks for text of the message.
* Arguments:
  * `text` - the needed text.,
  * `message_content_includes` - if true, the whole message doesn't need to match `text` but just include it,
  * `case_sensitive` - if true, the message has to exactly match `text` in terms of letter case.
  
> previous_message_author
* Checks for whoever sent a previous message in this message's channel.
* Arguments:
  * `author_id` - if `-1`, checks if the message is sent by the same account as this message,
  * `inverted` - if true, passes if the messages were sent by different accounts.
  
### Message trigger actions
> delete_message
* Deletes this message.
* Arguments:
  * `timeout` - time before deletion, in milliseconds,
  * `reason` - reason for this action to be logged.
  
> pin_message
* Pins this message.
  
> react_message
* Puts a reaction on this message.
* Arguments:
  * `emoji` - the emoji to put.
  
> send_message
* Sends a message.
* Arguments:
  * `channel_id` - a text channel to send the message to. `-1` for the same channel as this message's,
  * `text` - the text to send.
  
> set_role_mentionable
* Sets a role's mentionable setting.
* Arguments:
  * `role_id` - the role to change,
  * `force_mentionable` - `1` to always set to mentionable, `0` to always set to unmentionable, `-1` to switch between states each time this trigger activates.
  
> set_user_role
* Gives or removes someone's role.
* Arguments:
  * `role_id` - the role to use,
  * `forced_role` - `1` to always give, `0` to always remove, `-1` to switch each time this trigger activates.
  
> suppress_message_embeds
* Removes all message's embeds.

> unpin_message
* Unpins this message.