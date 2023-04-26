var Yahtzee = artifacts.require("Yahtzee");

module.exports =  function(deployer) {
    return deployer.deploy(Yahtzee);
};
