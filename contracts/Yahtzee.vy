# A simple implementation of Yahtzee in Vyper 

interface DieOracle:
    def gen_dice_roll(one: int8, two: int8, three: int8, four: int8, five: int8): nonpayable
    def rec_dice_roll(sender_addr: address, one: int8, two: int8, three: int8, four: int8, five: int8): nonpayable

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

event Selected:
    selected: bool[5]

players: address[2]
next_player: uint8
rollsLeft: uint8
dice: uint8[5]
selected: bool[5]
player_scores: int8[2][15]


# seed_to_roll: HashMap[bytes32, int8]
# game_start_time: uint256
oracle_contract: DieOracle

@external
def __init__(oracle_ad: address): 
    # self.game_start_time = block.timestamp
    self.oracle_contract = DieOracle(oracle_ad)
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
        self.selected[i] = True
    
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
def toggle_select_die(ind: uint8):
    if msg.sender != self.players[self.next_player]:
        raise "not your turn"
    self.selected[ind] = not self.selected[ind]
    log Selected(self.selected)

@external
def roll_dice():
    if msg.sender != self.players[self.next_player]:
        raise "not your turn"
    if self.rollsLeft == 0:
        raise "out of rolls"
    if not self.selected[0] and not self.selected[1] and not self.selected[2] and not self.selected[3] and not self.selected[4]:
        raise "you didn't select any dice to roll"
    if self.rollsLeft == 3 and (not self.selected[0] and not self.selected[1] and not self.selected[2] and not self.selected[3] and not self.selected[4]):
        raise "you have to roll all five dice to start your turn"
    self.generate_dice_roll()

@external
def bank_roll(category: uint32):
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
        if self.check_full_house() or (self.player_scores[12][player] >= 0 and self.check_yahtzee()): 
            val = 25
    elif category == 10: # SM straight
        if self.check_sm_straight() or (self.player_scores[12][player] >= 0 and self.check_yahtzee()): 
            val = 30
    elif category == 11: # LG straight
        if self.check_lg_straight() or (self.player_scores[12][player] >= 0 and self.check_yahtzee()): 
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
    for i in range(5):
        self.selected[i] = True
        self.dice[i] = 1
    
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
        log Selected(self.selected)

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
        if sum >= 63:
            self.player_scores[6][self.next_player] = 35
        else:
            self.player_scores[6][self.next_player] = 0

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
def top_numbers(num: int8) -> int8:
    sum: int8 = 0
    for d in self.dice:
        if convert(d, int8) == num: 
            sum += convert(d, int8)
    return sum

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
        for i in range(3,6):
            if i not in self.dice:
                return False
    else:
        for i in range(2, 6):
            if i not in self.dice:
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

## COMMUNICATE WITH ORACLE FOR DICE ROLLS
@internal
def generate_dice_roll():
    newd: int8[5] = [-1, -1, -1, -1, -1]
    if not self.selected[0]:
        newd[0] = convert(self.dice[0], int8)
    if not self.selected[1]:
        newd[1] = convert(self.dice[1], int8)
    if not self.selected[2]:
        newd[2] = convert(self.dice[2], int8)
    if not self.selected[3]:
        newd[3] = convert(self.dice[3], int8)
    if not self.selected[4]:
        newd[4] = convert(self.dice[4], int8)
    self.oracle_contract.gen_dice_roll(newd[0], newd[1], newd[2], newd[3], newd[4])

@external
def recieve_dice_roll(one: int8, two: int8, three:int8, four: int8, five: int8):
    self.dice = [convert(one, uint8), convert(two, uint8), convert(three, uint8), convert(four, uint8), convert(five, uint8)]
    self.rollsLeft -= 1
    log DiceState(self.dice, self.rollsLeft)

