tellraw @a "Bingo datapack by Mante. Run '/function bingo:reload' to prepare for starting, then '/function bingo:start'. Players are given 1 hour to collect as many items from the randomized list as they can."

forceload add -50 -50 50 50
fill -10 128 -10 10 128 10 bedrock
setworldspawn 0 129 0

scoreboard objectives add bingo_var dummy
scoreboard objectives add bingo_const dummy
scoreboard players set 60 bingo_const 60
scoreboard players set 20 bingo_const 20

scoreboard objectives add score dummy