# yahtzee-eth

A smart contract for the popular dice game Yahtzee.

## Yahtzee.vy
This is the smart contract that governs the game.  It maintains the game state as public storage variables, 
however it was designed to emit events on state changes for a front end to listen for.

## DieOracle.vy
This is the smart contract that conveys information to some off-chain (trusted) server so that a random
dice roll can be generated.

```
interface DieOracle:
    def gen_dice_roll(one: int8, two: int8, three: int8, four: int8, five: int8): nonpayable
    def rec_dice_roll(sender_addr: address, one: int8, two: int8, three: int8, four: int8, five: int8): nonpayable
```