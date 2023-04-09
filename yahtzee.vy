# A simple implementation of Yahtzee in Vyper 

players: immutable(address[2])

next_player: uint32
rollsLeft: uint32
dice: uint32[5]


@external
def __init__(player1: address, player2: address):
    players = [player1, player2]
    self.next_player = 0

@internal
def can_roll(player: address) -> bool:
    if player != players[next_player]:
        return false

@external
def roll_dice(dice_indices: uint32[]) -> uint32[]:
    if not can_roll(msg.sender):
        raise "not your turn"
    