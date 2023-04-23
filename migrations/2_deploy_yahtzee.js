var Yahtzee = artifacts.require("Yahtzee");

module.exports =  function(deployer) {
  deployer.deploy(Yahtzee);
};
