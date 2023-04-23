const Yahtzee = artifacts.require("Yahtzee");
const truffleAssert = require('truffle-assertions');
contract("Yahtzee", (accounts) => {
    const admin = accounts[0];
    let player1;
    let player2;
    let contract;
    let result;

    beforeEach(async () => {
        contract = await Yahtzee.new({ from: admin });
        result = await truffleAssert.createTransactionResult(contract, contract.transactionHash);
        result = await contract.join_game({from: accounts[1]});
        result = await contract.join_game({from: accounts[2]});
        truffleAssert.eventEmitted(result, 'Turn', (args) => {
            if (args.turn == accounts[1]) {
                player1 = accounts[1];
                player2 = accounts[2];
            } else {
                player1 = accounts[2];
                player2 = accounts[1];
            }
            return true; // just to assert that this event occurs
        })
    });

    afterEach(async () => {

    });

    it("test_initial_state", async () => {
        truffleAssert.eventEmitted(result, 'ScoreState', (ev) => {
            for (i = 0; i < 15; i++) {
                if (ev.player_scores[i][0] != -1 || ev.player_scores[i][1] != -1) {
                    return false;
                }
            }
            return true;
        });
        truffleAssert.eventEmitted(result, 'DiceState', (args) => {
            return args.rollsLeft == 3;
        })
        truffleAssert.eventEmitted(result, 'Turn', (args) => {
            return true; // just to assert that this event occurs
        })
        truffleAssert.eventNotEmitted(result, 'GameOver');
    })

  it("test_roll_dice", async () => {
    
    truffleAssert.reverts(contract.roll_dice(true, true, true, true, true, {from: player2}), 
        null, "player 2 cannot roll first");
    truffleAssert.reverts(contract.roll_dice(false, true, true, true, true, {from: player1}),
        null, "you must roll all dice to start a turn");
    let result = await contract.roll_dice(true, true, true, true, true, {from: player1})
    truffleAssert.eventEmitted(result, 'DiceState', (ev) => {return ev.rollsLeft == 2});
    result = await contract.roll_dice(true, true, true, true, true, {from: player1})
    truffleAssert.eventEmitted(result, 'DiceState', (ev) => {return ev.rollsLeft == 1});
    
    let dump = await contract.dice_dump({from: player1});
    result = await contract.roll_dice(false, true, false, true, true, {from: player1});
    let og_dice;
    truffleAssert.eventEmitted(dump, 'DiceState', (ev) => {
        og_dice = ev.dice;
        return true;
    });
    truffleAssert.eventEmitted(result, 'DiceState', (ev) => {
        return ev.dice[0].words[0] == og_dice[0].words[0] && ev.dice[2].words[0] == og_dice[2].words[0];
    });
    truffleAssert.reverts(contract.roll_dice(true, true, true, true, true, {from: player1}), 
        null, 'player1 has run out of rolls');
  });

  it("test_bank_roll", async () => {
    truffleAssert.reverts(contract.bank_roll(0, {from: player2}),
        null, "not player2's turn");
    truffleAssert.reverts(contract.bank_roll(0, {from: player1}),
        null, "need to roll dice at least once before banking");
    await contract.roll_dice(true, true, true, true, true, {from: player1});
    truffleAssert.reverts(contract.bank_roll(6, {from: player1}),
        null, "6 is not a valid categories");
    truffleAssert.reverts(contract.bank_roll(14, {from: player1}),
        null, "14 is not a valid categories");
    let result = await contract.bank_roll(0, {from: player1}); // bank aces
    truffleAssert.eventEmitted(result, 'ScoreState', (ev) => {
        // everything but aces should be -1
        for (i = 1; i < 15; i++) {
            if (ev.player_scores[i][0] >= 0) {
                return false;
            }
        }
        return ev.player_scores[0][0] >= 0
    });
    truffleAssert.eventEmitted(result, 'Turn', (ev) => {
        return ev.turn == player2;
    });
    truffleAssert.reverts(contract.roll_dice(true, true, true, true, true, {from: player1}), 
        null, "it's not player1's turn anymore");
    truffleAssert.reverts(contract.roll_dice(false, true, true, true, true, {from: player2}), 
        null, "player2 needs to roll all the dice");
    await contract.roll_dice(true, true, true, true, true, {from: player2});
    result = await contract.bank_roll(9, {from: player2}); // bank full house
    truffleAssert.eventEmitted(result, 'ScoreState', (ev) => {
        for (i = 0; i < 15; i++) {
            if (i == 9) { continue; }
            else if (ev.player_scores[i][1] >= 0) {
                return false;
            }
        }
        return ev.player_scores[9][1] >= 0; 
    });
    truffleAssert.reverts(contract.roll_dice(true, true, true, true, true, {from: player2}),
        null, "back to player1's turn")
    await contract.roll_dice(true, true, true, true, true, {from: player1});
    result = await contract.bank_roll(7, {from: player1}); // bank three of a kind
    truffleAssert.eventEmitted(result, 'ScoreState', (ev) => {
        return ev.player_scores[7][0] >= 0;
    });
  });

  it('test_bonus', async () => {
    for(i = 0; i < 5; i++) {
        await contract.roll_dice(true, true, true, true, true, {from: player1});
        await contract.bank_roll(i, {from: player1});
        await contract.roll_dice(true, true, true, true, true, {from: player2});
        let result = await contract.bank_roll(i, {from: player2});
        truffleAssert.eventEmitted(result, 'ScoreState', (ev) => {
            return ev.player_scores[6][0] == -1 && ev.player_scores[6][1] == -1;
        });
    }
    await contract.roll_dice(true, true, true, true, true, {from: player1});
    await contract.bank_roll(5, {from: player1});
    await contract.roll_dice(true, true, true, true, true, {from: player2});
    let result = await contract.bank_roll(5, {from: player2});
    truffleAssert.eventEmitted(result, 'ScoreState', (ev) => {
        return ev.player_scores[6][0] >= 0 && ev.player_scores[6][1] >= 0;
    });
  });

  it('test_total', async () => {
    for (i = 0; i < 13; i++) {
        if (i == 6) { continue; }
        await contract.roll_dice(true, true, true, true, true, {from: player1});
        await contract.bank_roll(i, {from: player1});
        await contract.roll_dice(true, true, true, true, true, {from: player2});
        let result = await contract.bank_roll(i, {from: player2});
        truffleAssert.eventEmitted(result, 'ScoreState', (ev) => {
            return ev.player_scores[14][0] == -1 && ev.player_scores[14][1] == -1;
        });
    }
    await contract.roll_dice(true, true, true, true, true, {from: player1});
    await contract.bank_roll(13, {from: player1});
    await contract.roll_dice(true, true, true, true, true, {from: player2});
    let result = await contract.bank_roll(13, {from: player2});
    truffleAssert.eventEmitted(result, 'ScoreState', (ev) => {
        return ev.player_scores[14][0] >= 0 && ev.player_scores[14][1] >= 0;
    });
    truffleAssert.eventEmitted(result, 'GameOver', (ev) => {
        return ev.winning_score.words[0] >= ev.losing_score.words[0];
    });
  })
});
