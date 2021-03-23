scoreboard objectives add bingo_var dummy
scoreboard players set time bingo_var 0
scoreboard players set playing bingo_var 1
forceload add -50 -50 50 50
fill -10 129 -10 10 135 10 air
setblock 0 128 0 water
spawnpoint @a 0 129 0
tp @a 0 129 0
time set 0
weather clear 999999

advancement grant @a only bingo:root
advancement grant @a only bingo:5_0
advancement grant @a only bingo:5_1
advancement grant @a only bingo:5_2
advancement grant @a only bingo:5_3
advancement grant @a only bingo:5_4

scoreboard players set @a score 0
scoreboard objectives setdisplay sidebar score
scoreboard objectives modify score displayname "Score"