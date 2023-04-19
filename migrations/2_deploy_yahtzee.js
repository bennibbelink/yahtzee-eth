var Yahtzee = artifacts.require("Yahtzee");

module.exports = async function(deployer) {
  const accounts = await web3.eth.getAccounts();
  deployer.deploy(Yahtzee, accounts[1], accounts[2], {from: accounts[0], overwrite: false});
};
