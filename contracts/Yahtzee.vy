# A simple implementation of Yahtzee in Vyper 
event GameOver:
    winner: address
    loser: address
    winning_score: int8
    losing_score: int8

event DiceState:
    dice: uint8[5]
    rollsLeft: uint8

event ScoreState:
    players: address[2]
    player_scores: int8[2][15]

event Turn:
    turn: address

players: address[2]
next_player: uint8
rollsLeft: uint8
dice: uint8[5]
player_scores: int8[2][15]


# seed_to_roll: HashMap[bytes32, int8]
# game_start_time: uint256


@external
def __init__(): 
    # self.game_start_time = block.timestamp
    self.reset_game()


@internal
def reset_game():
    self.players = empty(address[2])
    self.next_player = 2
    for i in range(15):
        self.player_scores[i][0] = -1
        self.player_scores[i][1] = -1
    self.rollsLeft = 3
    for i in range(5):
        self.dice[i] = 1
    
@external
def join_game():
    # if block.timestamp > self.game_start_time + 7200: 
    #     self.reset_game()
    if self.players[0] == msg.sender or self.players[1] == msg.sender:
        raise "You are already in the game"
    if self.players[0] == empty(address):
        self.players[0] = msg.sender
        log Turn(empty(address))
        log DiceState(self.dice, self.rollsLeft)
        log ScoreState(self.players, self.player_scores)
    elif self.players[1] == empty(address):
        self.players[1] = msg.sender
        seed: bytes32 = convert(block.timestamp, bytes32)
        self.next_player = convert(convert(sha256(seed), uint256) % 2, uint8) # do this after joining so players can't see who goes first before joining
        log Turn(self.players[self.next_player])
        log DiceState(self.dice, self.rollsLeft)
        log ScoreState(self.players, self.player_scores)
    else:
        raise "Game currently in progress, can't join right now"

@external
def roll_dice(one: bool, two: bool, three: bool, four: bool, five: bool):
    if self.has_winner():
        raise "the game is over"
    if msg.sender != self.players[self.next_player]:
        raise "not your turn"
    if self.rollsLeft == 0:
        raise "out of rolls"
    if not one and not two and not three and not four and not five:
        raise "you didn't select any dice to roll"
    if self.rollsLeft == 3 and (not one and not two and not three and not four and not five):
        raise "you have to roll all five dice to start your turn"
    
    if one:
        self.dice[0] = self.generate_roll(1)
    if two:
        self.dice[1] = self.generate_roll(2)
    if three:
        self.dice[2] = self.generate_roll(3)
    if four:
        self.dice[3] = self.generate_roll(4)
    if five:
        self.dice[4] = self.generate_roll(5)
    self.rollsLeft = self.rollsLeft - 1
    log DiceState(self.dice, self.rollsLeft)
    
@external
def bank_roll(category: uint32):
    if self.has_winner():
        raise "the game is over"
    if msg.sender != self.players[self.next_player]:
        raise "not your turn"
    if self.rollsLeft == 3:
        raise "you haven't rolled"
    player: uint8 = 0
    if msg.sender == self.players[0]: 
        player = 0
    else: 
        player = 1
    
    if category > 13 or category == 6:
        raise "not a valid category"

    if self.player_scores[category][player] > -1: 
        raise "you already banked that category"
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
        raise 'can\'t bank the bonus, have to earn it'
    elif category == 7: # 3 of a kind
        val = self.check_x_of_a_kind(3)
    elif category == 8: # 4 of a kind
        val = self.check_x_of_a_kind(4)
    elif category == 9: # full house
        if self.check_full_house():# or (self.player_scores[12][player] >= 0 and self.check_yahtzee() and self.player_scores[convert(self.dice[0] - 1, uint256)][player] >= 0): 
            val = 25
    elif category == 10: # SM straight
        if self.check_sm_straight():# or (self.player_scores[12][player] >= 0 and self.check_yahtzee() and self.player_scores[convert(self.dice[0] - 1, uint256)][player] >= 0): 
            val = 30
    elif category == 11: # LG straight
        if self.check_lg_straight():# or (self.player_scores[12][player] >= 0 and self.check_yahtzee() and self.player_scores[convert(self.dice[0] - 1, uint256)][player] >= 0): 
            val = 40
    elif category == 12: # yahtzee
        if self.check_yahtzee():
            val = 50
    elif category == 13: # chance
        for d in self.dice:
            val += convert(d, int8)
    elif category == 14: # total
        raise 'can\'t bank the total, it is the sum of your categories'
    else:
        raise "not a valid category"

    self.player_scores[category][player] = val
    self.check_bonus()
    self.check_total()
    self.rollsLeft = 3
    self.next_player = (self.next_player + 1) % 2

    if self.has_winner():
        log ScoreState(self.players, self.player_scores)
        winner: uint8 = 0
        loser: uint8 = 1
        if self.player_scores[14][1] > self.player_scores[14][0]:
            winner = 1
            loser = 0
        log GameOver(self.players[winner], self.players[loser], self.player_scores[14][winner], self.player_scores[14][loser])
        self.reset_game()
    else:
        log DiceState(self.dice, self.rollsLeft)
        log Turn(self.players[self.next_player])
        log ScoreState(self.players, self.player_scores)

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
    # if both self.players have a total score then the game is over
    return self.player_scores[14][0] >= 0 and self.player_scores[14][1] >= 0

@external
# @view
def turn_dump():
    if self.next_player == 2: # the game hasn't started yet
        log Turn(empty(address))
    else:
        log Turn(self.players[self.next_player])

@external
# @view
def dice_dump():
    log DiceState(self.dice, self.rollsLeft)

@external
# @view
def score_dump():
    log ScoreState(self.players, self.player_scores)

@internal
def top_numbers(num: uint8) -> int8:
    sum: uint8 = 0
    for d in self.dice:
        if d == num: 
            sum += d
    return convert(sum, int8)

@internal
def check_x_of_a_kind(x: uint8) -> int8:
    map: uint8[6] = empty(uint8[6])
    have_x: bool = False
    sum: uint8 = 0
    for d in self.dice:
        sum += d
        map[d] += 1
        if map[d] >= x:
            have_x = True
    if have_x: 
        return convert(sum, int8)
    return 0

@internal
def check_full_house() -> bool:
    a: int8 = -1
    b: int8 = -1
    for d in self.dice:
        di: int8 = convert(d, int8)
        if a == -1:
            a = di
        elif b == -1:
            b = di
        elif di != a and di != b:
            return False
    return True

@internal
def check_sm_straight() -> bool:
    if 1 in self.dice:
        for i in range(2,5):
            if i not in self.dice:
                return False
    elif 6 in self.dice:
        for i in range(2,6):
            if i not in self.dice:
                return False
    else: 
        return False
    return True

@internal
def check_lg_straight() -> bool:
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
def check_yahtzee() -> bool:
    return self.dice[0]==self.dice[1] and self.dice[0]==self.dice[2] and self.dice[0]==self.dice[3] and self.dice[0]==self.dice[4]

@internal 
def generate_roll(seed: int256) -> uint8:
    x: int256 = convert(block.timestamp, int256)
    y: int256 = x + seed
    hash: bytes32 = sha256(convert(y, bytes32))
    u8: uint256 = convert(hash, uint256) % 6 + 1
    return convert(u8, uint8)

