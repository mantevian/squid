execute if score playing bingo_var matches 1 run scoreboard players add time bingo_var 1
execute if score playing bingo_var matches 1 run function bingo:show_time
execute if score playing bingo_var matches 1 if score time bingo_var matches 72000 run function bingo:end

execute if score playing bingo_var matches 0 run effect give @a saturation 1 5 true
execute if score playing bingo_var matches 0 run effect give @a resistance 1 5 true
execute if score playing bingo_var matches 0 run effect give @a weakness 1 5 true