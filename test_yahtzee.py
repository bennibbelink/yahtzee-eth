import pytest
from eth_tester.exceptions import TransactionFailed


@pytest.fixture
def yahtzee_contract(w3, get_vyper_contract):
    with open("yahtzee.vy", encoding='utf-8') as infile:
        contract_code = infile.read()
    args = [w3.eth.accounts[0], w3.eth.accounts[1]]
    return get_vyper_contract(contract_code, *args)

def test_initial_state(w3, yahtzee_contract):
    player1 = w3.eth.accounts[0]
    player2 = w3.eth.accounts[1]
    for i in range(15):
        assert yahtzee_contract.score_dump(player1, i) == -1
        assert yahtzee_contract.score_dump(player2, i) == -1

def test_roll_dice(w3, yahtzee_contract):
    player1 = w3.eth.accounts[0]
    player2 = w3.eth.accounts[1]

    with pytest.raises(TransactionFailed):
        # its not player 2's turn
        yahtzee_contract.roll_dice(True, True, True, True, True, transact={"from": player2})
    
    with pytest.raises(TransactionFailed):
        # you have to roll at least one die
        yahtzee_contract.roll_dice(False, False, False, False, False, transact={"from": player1})

    yahtzee_contract.roll_dice(True, True, True, True, True, transact={"from": player1})
    yahtzee_contract.roll_dice(True, True, True, True, True, transact={"from": player1})
    
    # we should be able to specify which dice to reroll
    # those we don't select shouldn't change value
    dice1 = yahtzee_contract.dice_dump()[0]
    dice4 = yahtzee_contract.dice_dump()[3]
    yahtzee_contract.roll_dice(False, True, True, False, True, transact={"from": player1})
    assert yahtzee_contract.dice_dump()[0] == dice1
    assert yahtzee_contract.dice_dump()[3] == dice4

    with pytest.raises(TransactionFailed):
        # we've run out of rolls
        yahtzee_contract.roll_dice(False, True, True, False, True, transact={"from": player1})

def test_bank_roll(w3, yahtzee_contract):
    player1 = w3.eth.accounts[0]
    player2 = w3.eth.accounts[1]

    with pytest.raises(TransactionFailed):
        # its not player 2's turn
        yahtzee_contract.bank_roll(0, transact={"from": player2})
    with pytest.raises(TransactionFailed):
        # player 1 must roll at least once
        yahtzee_contract.bank_roll(0, transact={"from": player1})

    yahtzee_contract.roll_dice(True, True, True, True, True, transact={"from": player1})
    # only 0-5, and 7-13 are valid categories
    with pytest.raises(TransactionFailed):
        yahtzee_contract.bank_roll(6, transact={"from": player1})
    with pytest.raises(TransactionFailed):
        yahtzee_contract.bank_roll(14, transact={"from": player1})

    yahtzee_contract.bank_roll(0, transact={"from": player1})
    # if we bank our ones we should have 5 points in that category
    assert yahtzee_contract.score_dump(player1, 0) >= 0
    # everything else should be unset
    for i in range(1, 15):
        assert yahtzee_contract.score_dump(player1, i) == -1

    with pytest.raises(TransactionFailed):
        # player1 can't bank twice in a row
        yahtzee_contract.roll_dice(True, True, True, True, True, transact={"from": player1})

    with pytest.raises(TransactionFailed):
        # player2 needs to roll
        yahtzee_contract.bank_roll(0, transact={"from": player2})

    with pytest.raises(TransactionFailed):
        # player2 needs to roll all dice
        yahtzee_contract.roll_dice(False, True, True, True, True, transact={"from": player2})

    yahtzee_contract.roll_dice(True, True, True, True, True, transact={"from": player2})

    yahtzee_contract.bank_roll(9, transact={"from": player2}) # bank full house
    assert yahtzee_contract.score_dump(player2, 9) >= 0

    with pytest.raises(TransactionFailed):
        # should go back to player 1
        yahtzee_contract.roll_dice(True, True, True, True, True, transact={"from": player2})

    yahtzee_contract.roll_dice(True, True, True, True, True, transact={"from": player1})
    yahtzee_contract.bank_roll(7, transact={"from": player1}) # bank full house
    assert yahtzee_contract.score_dump(player1, 7) >= 0
    
def test_bonus(w3, yahtzee_contract):
    player1 = w3.eth.accounts[0]
    player2 = w3.eth.accounts[1]
    for i in range(6):
        # the bonus category will be unset until all the top section has been filled
        assert yahtzee_contract.score_dump(player1, 6) < 0
        assert yahtzee_contract.score_dump(player2, 6) < 0
        yahtzee_contract.roll_dice(True, True, True, True, True, transact={"from": player1})
        yahtzee_contract.bank_roll(i, transact={"from": player1}) # bank full house
        yahtzee_contract.roll_dice(True, True, True, True, True, transact={"from": player2})
        yahtzee_contract.bank_roll(i, transact={"from": player2}) # bank full house
    assert yahtzee_contract.score_dump(player1, 6) >= 0
    assert yahtzee_contract.score_dump(player2, 6) >= 0

def test_total(w3, yahtzee_contract):
    player1 = w3.eth.accounts[0]
    player2 = w3.eth.accounts[1]
    for i in range(14):
        if i == 6: continue
        assert yahtzee_contract.score_dump(player1, 14) < 0
        assert yahtzee_contract.score_dump(player2, 14) < 0
        yahtzee_contract.roll_dice(True, True, True, True, True, transact={"from": player1})
        yahtzee_contract.bank_roll(i, transact={"from": player1}) # bank full house
        yahtzee_contract.roll_dice(True, True, True, True, True, transact={"from": player2})
        yahtzee_contract.bank_roll(i, transact={"from": player2}) # bank full house
    assert yahtzee_contract.score_dump(player1, 14) >= 0
    assert yahtzee_contract.score_dump(player2, 14) >= 0




