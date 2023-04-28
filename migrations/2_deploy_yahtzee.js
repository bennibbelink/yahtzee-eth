var Yahtzee = artifacts.require("Yahtzee");
var DieOracle = artifacts.require("DieOracle");

module.exports =  function(deployer) {
  deployer.deploy(DieOracle).then(() => {
    return deployer.deploy(Yahtzee, DieOracle.address)
  })
};
