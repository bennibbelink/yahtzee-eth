import Yahtzee as Contract

event GenerateDie:
    sender_addr: address
    dice_to_roll: int8[5]

@external
def __init__(): 
    pass

@external 
def gen_dice_roll(one: int8, two: int8, three: int8, four: int8, five: int8):
    log GenerateDie(msg.sender, [one, two, three, four, five])

@external
def rec_dice_roll(sender_addr: address, one: int8, two: int8, three: int8, four: int8, five: int8):
    Contract(sender_addr).receive_dice_roll(one, two, three, four, five)


