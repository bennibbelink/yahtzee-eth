# A simple implementation of Yahtzee in Vyper 
event GameOver:
    winner: address
    loser: address
    winning_score: int8
    losing_score: int8

event DiceState:
    dice: int8[5]
    rollsLeft: uint8

event ScoreState:
    players: address[2]
    player_scores: int8[2][15]

event Turn:
    turn: address

players: immutable(address[2])
next_player: uint8
rollsLeft: uint8
dice: int8[5]
player_scores: int8[2][15]



@external
def __init__(player1: address, player2: address):
    self.next_player = 0
    players = [player1, player2]
    for i in range(15):
        self.player_scores[i][0] = -1
        self.player_scores[i][1] = -1
    self.rollsLeft = 3
    for i in range(5):
        self.dice[i] = 1
    log Turn(players[self.next_player])
    log DiceState(self.dice, self.rollsLeft)
    log ScoreState(players, self.player_scores)


@external
def roll_dice(one: bool, two: bool, three: bool, four: bool, five: bool):
    if self.has_winner():
        raise "revert: revert: the game is over"
    if msg.sender != players[self.next_player]:
        raise "revert: not your turn"
    if self.rollsLeft == 0:
        raise "revert: out of rolls"
    if not one and not two and not three and not four and not five:
        raise "revert: you didn't select any dice to roll"
    if self.rollsLeft == 3 and (not one or not two or not three or not four or not five):
        raise "revert: you have to roll all five dice to start your turn"
    
    if one: 
        self.dice[0] = self.generate_rand_number(self.dice[0])
    if two: 
        self.dice[1] = self.generate_rand_number(self.dice[1])
    if three: 
        self.dice[2] = self.generate_rand_number(self.dice[2])
    if four: 
        self.dice[3] = self.generate_rand_number(self.dice[3])
    if five: 
        self.dice[3] = self.generate_rand_number(self.dice[4])
    
    self.rollsLeft -= 1
    log DiceState(self.dice, self.rollsLeft)

@external
def bank_roll(category: uint32):
    if self.has_winner():
        raise "revert: the game is over"
    if msg.sender != players[self.next_player]:
        raise "revert: not your turn"
    if self.rollsLeft == 3:
        raise "revert: you haven't rolled"
    player: uint8 = 0
    if msg.sender == players[0]: 
        player = 0
    else: 
        player = 1
    
    if category > 13 or category == 6:
        raise "revert: not a valid category"

    if self.player_scores[category][player] > -1: 
        raise "revert: you already banked that category"
    val: int8 = 0
    if category == 0: # ones
        val = self.top_numbers(1) 
    elif category == 1: # twos
        val = self.top_numbers(2)
    elif category == 2: # threes
        val = self.top_numbers(3)
    elif category == 3: # fours
        val = self.top_numbers(4)
    elif category == 4: # fives
        val = self.top_numbers(5)
    elif category == 5: # sixes
        val = self.top_numbers(6)
    elif category == 6: # bonus
        raise 'revert: can\'t bank the bonus, have to earn it'
    elif category == 7: # 3 of a kind
        val = self.check_x_of_a_kind(3)
    elif category == 8: # 4 of a kind
        val = self.check_x_of_a_kind(4)
    elif category == 9: # full house
        if self.check_full_house(): 
            val = 25
    elif category == 10: # SM straight
        if self.check_sm_straight(): 
            val = 30
    elif category == 11: # LG straight
        if self.check_lg_straight(): 
            val = 40
    elif category == 12: # yahtzee
        if self.dice[0]==self.dice[1] and self.dice[0]==self.dice[2] and self.dice[0]==self.dice[3] and self.dice[0]==self.dice[4]:
            val = 50
    elif category == 13: # chance
        for d in self.dice:
            val += d
    elif category == 14: # total
        raise 'revert: can\'t bank the total, it is the sum of your categories'
    else:
        raise "revert: not a valid category"

    self.player_scores[category][player] = val
    self.check_bonus()
    self.check_total()
    self.rollsLeft = 3
    self.next_player = (self.next_player + 1) % 2

    if self.has_winner():
        log ScoreState(players, self.player_scores)
        winner: uint8 = 0
        loser: uint8 = 1
        if self.player_scores[14][1] > self.player_scores[14][0]:
            winner = 1
            loser = 0

        log GameOver(players[winner], players[loser], self.player_scores[14][winner], self.player_scores[14][loser])
    else:
        log DiceState(self.dice, self.rollsLeft)
        log Turn(players[self.next_player])
        log ScoreState(players, self.player_scores)

@internal
def check_bonus():
    complete: bool = True
    sum: int8 = 0
    for i in range(6):
        if self.player_scores[i][self.next_player] >= 0:
            sum += self.player_scores[i][self.next_player]
        else:
            complete = False
            break
    if complete:
        self.player_scores[6][self.next_player] = sum

@internal
def check_total():
    complete: bool = True
    sum: int8 = 0
    for i in range(14):
        if self.player_scores[i][self.next_player] >= 0:
            sum += self.player_scores[i][self.next_player]
        else:
            complete = False
            break
    if complete:
        self.player_scores[14][self.next_player] = sum

@internal
def has_winner() -> bool:
    # the total score will be set when all other categories are full
    # if both players have a total score then the game is over
    return self.player_scores[14][0] >= 0 and self.player_scores[14][1] >= 0

@external
# @view
def turn_dump():
    log Turn(players[self.next_player])

@external
# @view
def dice_dump():
    log DiceState(self.dice, self.rollsLeft)

@external
# @view
def score_dump():
    log ScoreState(players, self.player_scores)

@internal
def top_numbers(num: int8) -> int8:
    sum: int8 = 0
    for d in self.dice:
        if d == num: 
            sum += d
    return sum

@internal
def check_x_of_a_kind(x: int8) -> int8:
    map: int8[6] = empty(int8[6])
    have_x: bool = False
    sum: int8 = 0
    for d in self.dice:
        sum += d
        map[d] += 1
        if map[d] >= x:
            have_x = True
    if have_x: 
        return sum
    return 0

@internal
def check_full_house() -> bool:
    a: int8 = -1
    b: int8 = -1
    num_a: uint8 = 0
    num_b: uint8 = 0
    for d in self.dice:
        if a == -1:
            a = d
            num_a += 1
        elif b == -1:
            b = d
            num_b += 1
        elif d != a and d != b:
            return False
    return True

@internal
def check_sm_straight() -> bool:
    if 1 in self.dice:
        for i in range(2,6):
            if i not in self.dice:
                return False
    elif 6 in self.dice:
        for i in range(2,7):
            if i not in self.dice:
                return False
    else: 
        return False
    return True

@internal
def check_lg_straight() -> bool:
    for i in range(1,7):
        if i not in self.dice: 
            return False
    return True

##### THIS IS TEMPORARY #####
@internal
def generate_rand_number(temp: int8) -> int8:
    return temp^3 % 6 + 1

