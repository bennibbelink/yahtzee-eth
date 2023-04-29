// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
var fs = require('fs');

async function main() {
  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const unlockTime = currentTimestampInSeconds + 60;

  const DieOracle = await hre.ethers.getContractFactory("DieOracle")
  const Yahtzee = await hre.ethers.getContractFactory("Yahtzee")
  const oracle = await DieOracle.deploy();
  

  await oracle.deployed();
  const yahtzee = await Yahtzee.deploy(oracle.address);
  await yahtzee.deployed();

  let obj = {
    'yahtzee' : {
      'address': yahtzee.address,
    },
    'oracle' : {
      'address' : oracle.address,
    }
  }

  fs.writeFile('contract-info.json', JSON.stringify(obj), 'utf8', () => {
    console.log('contract info written to contract-info.json\n')
  });

  // const Lock = await hre.ethers.getContractFactory("Lock");
  // const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  // await lock.deployed();

  console.log(
    `Yahtzee deployed to ${yahtzee.address}\nDieOracle deployed to ${oracle.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
