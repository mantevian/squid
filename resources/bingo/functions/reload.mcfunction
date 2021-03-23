forceload add -50 -50 50 50
fill -10 128 -10 10 135 10 barrier
fill -9 129 -9 9 134 9 air
fill -10 128 -10 10 128 10 bedrock
spawnpoint @a 0 129 0
tp @a 0 129 0

scoreboard objectives add bingo_var dummy
scoreboard objectives add bingo_const dummy
scoreboard players set 60 bingo_const 60
scoreboard players set 20 bingo_const 20

scoreboard players set time bingo_var 0
scoreboard players set playing bingo_var 0

function bingo:reset_players