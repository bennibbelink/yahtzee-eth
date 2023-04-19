const Yahtzee = artifacts.require("Yahtzee");
const player1 = '0xeb445466353E2b56f16223dC4d77deA90b4ba8D5';
const player2 = '0xacE7c2Ba82cBa9A4ACFa8c529D90650A3F6C6B93';
contract("Yahtzee", () => {
  it("test_initial_state", async () => {
    const accounts = await web3.eth.getAccounts();
    const player1 = accounts[1];
    const player2 = accounts[2];
    const yc = await Yahtzee.deployed();
    for (i = 0; i < 15; i++) {
        const score1 = await yc.score_dump(player1, i);
        const score2 = await yc.score_dump(player2, i);
        assert.equal(score1, -1, `The initial score for P1 category ${i} is not -1`)
        assert.equal(score2, -1, `The initial score for P2 category ${i} is not -1`)
    }
  });

  it("test_roll_dice", async () => {
    const accounts = await web3.eth.getAccounts();
    const player1 = accounts[1];
    const player2 = accounts[2];
    const yc = await Yahtzee.deployed();
    try {
        const res = await yc.roll_dice(true, true, true, true, true, {"from": player2});
        assert.false(res);
    }
    catch (err) {
        assert.include(err.message, "revert", "The error message should contain 'revert'");
    }
    try {
        await yc.roll_dice(false, true, true, true, true, {"from": player1});
        // assert.fail("you must roll all dice to start");
    }
    catch (err) {
        assert.include(err.message, "revert", "The error message should contain 'revert'");
    }
    
    await yc.roll_dice(true, true, true, true, true, {"from": player1});
    await yc.roll_dice(true, true, true, true, true, {"from": player1});
    const dump = await yc.dice_dump();
    await yc.roll_dice(false, true, true, false, true, {"from": player1})
    const new_dump = await yc.dice_dump();
    assert.equal(dump[0], new_dump[0], "the dice values are not equal")
    assert.equal(dump[3], new_dump[3], "the dice values are not equal")

    try {
        await yc.roll_dice(false, true, true, false, true, {"from": player1});
        assert.fail("you've run out of rolls'");
    }
    catch (err) {
        assert.include(err.message, "revert", "The error message should contain 'revert'");
    }
  });
});
