#!/usr/bin/env node
import Web3 from 'web3'
import fs from 'fs';
// import hre from 'hardhat';
// import "@nomiclabs/hardhat-ethers";

const ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"


const web3 = new Web3('ws://127.0.0.1:8545');

// get contract info from our static file
let rawdata = fs.readFileSync('contract-info.json');
let contractdata = JSON.parse(rawdata);
const address = contractdata.oracle.address;

let abidata = fs.readFileSync('artifacts/contracts/DieOracle.vy/DieOracle.json');
let abi = JSON.parse(abidata).abi;

// get the actual contract instance
const contract = new web3.eth.Contract(abi, address);

function getRandomRoll() {
    return Math.floor(Math.random() * 6) + 1;
}

function eventHandler(ev) {
    var dice = ev['returnValues']['dice_to_roll'];
    let yahtaddr = ev['returnValues']['sender_addr'];
    let shallowDice = Object.assign({}, dice);
    for (let i = 0; i < dice.length; i++) {
        if (dice[i] === '-1') {
            shallowDice[i] = getRandomRoll();
        }
    }
    console.log('generating dice roll')
    sendDiceToOracle(yahtaddr, shallowDice);
}

async function sendDiceToOracle(yahtAddr, dice) {
    const query = contract.methods.rec_dice_roll(yahtAddr, dice[0], dice[1], dice[2], dice[3], dice[4]);
    const encodedABI = query.encodeABI();    
    const signedTx = await web3.eth.accounts.signTransaction(
        {
            data: encodedABI,
            from: ACCOUNT,
            gas: 3000000,
            gasPrice: 2000000000,
            to: contract.options.address,
        },
        KEY,
        false,
    );
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}

contract.events.GenerateDie({}).on('data', (ev) => {
    // console.log(ev);
    eventHandler(ev);
}).on('connected', () => {
    console.log('connected');
});
// DieOracle.on("connect", () => {
//     console.log('connect')
// })
// instance.events.GenerateDie(options).on('data', (ev) => eventHandler(ev));
// instance.events.GenerateDie(options).on('connected', (ev) => console.log("connected"));
