var Yahtzee = artifacts.require("Yahtzee");

module.exports = async function(deployer) {
  const accounts = await web3.eth.getAccounts();
  deployer.deploy(Yahtzee, {from: accounts[0]});
};
