# A simple implementation of Yahtzee in Vyper 

players: immutable(address[2])

next_player: uint32
rollsLeft: uint32
dice: uint32[5]

player1_scores: HashMap[uint32, uint32]
player2_scores: HashMap[uint32, uint32]


@external
def __init__(player1: address, player2: address):
    players = [player1, player2]
    self.next_player = 0
    for i in range(15):
        player1_scores[i] = -1
        player2_scores[i] = -1



@external
def roll_dice(dice_indices: uint32[]) -> uint32[]:
    if msg.sender != players[next_player]
        raise "not your turn"
    if rollsLeft == 0:
        raise "out of rolls"
    if length(dice_indices) == 0:
        raise "you've set aside all the dice"
    for ind in dice_indices:
        self.dice[ind] = generate_rand_number(self.dice[ind])
    return self.dice

@external
def bank_roll(category: uint32):
    if msg.sender != players[next_player]:
        raise "not your turn"
    if msg.sender == self.player1: 
        scores = self.player1_scores
    else: 
        scores = self.player2_scores

    if scores[category] > -1: 
        raise "you already banked that category"
    val = 0
    if category == 0: # ones
        val = top_numbers(1) 
    elif category == 1: # twos
        val = top_numbers(2)
    elif category == 2: # threes
        val = top_numbers(3)
    elif category == 3: # fours
        val = top_numbers(4)
    elif category == 4: # fives
        val = top_numbers(5)
    elif category == 5: # sixes
        val = top_numbers(6)
    elif category == 6: # bonus
        raise 'can\'t bank the bonus, have to earn it'
    elif category == 7: # 3 of a kind
        val = check_x_of_a_kind(3)
    elif category == 8: # 4 of a kind
        val = check_x_of_a_kind(4)
    elif category == 9: # full house
        val = 25 if check_full_house() else 0
    elif category == 10: # SM straight
        val = 30 if check_sm_straight() else 0
    elif category == 11: # LG straight
        val = 40 if check_lg_straight() else 0
    elif category == 12: # yahtzee
        d = self.dice
        if d[0] == d[1] == d[2] == d[3] == d[4] == d[5]:
            val = 50
    elif category == 13: # chance
        for d in self.dice:
            val += d
    elif category == 14: # total
        'can\'t bank the total, it is the sum of your categories'
    else:
        raise "not a valid category"
    scores[category] = val
    

@internal
def top_numbers(num: uint32) -> uint32:
    sum = 0
    for d in self.dice:
        if d == num: sum += d
    return sum

@internal
def check_x_of_a_kind(x: uint32) -> uint32:
    map = HashMap[uint32, uint32]
    for d in self.dice:
        map[d] += 1
        if map[d] >= x:
            return sum(self.dice)
    return 0

@internal
def check_full_house() -> bool:
    a = -1
    b = -1
    num_a = 0
    num_b = 0
    for d in self.dice:
        if a == -1:
            a = d
            num_a += 1
        elif b == -1:
            b = d
            num_b += 1
        elif d == a: num_a += 1
        elif d == b: num_b += 1
        else return False
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
    else return False
    return True

@internal
def check_lg_straight() -> bool:
    for i in range(1,7):
        if i not in self.dice: 
            return False
    return True

##### THIS IS TEMPORARY #####
@internal
def generate_rand_number(temp: uint32):
    return temp^3 % 6 + 1