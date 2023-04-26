#!/usr/bin/env node
import Web3 from 'web3'
import fs from 'fs';

const ACCOUNT = "0xE9Bc1552547E8F03c39f526209677E2147fb6ccF"
const KEY = "0x5b2088fd456c3387e5237d741c6c428d910fa871a444a10f46ea0fb4768ad08b"

const ethereum = new Web3('ws://127.0.0.1:8545').eth;
const chainId = await ethereum.getChainId();

let rawdata = fs.readFileSync('../build/contracts/DieOracle.json');
let contract = JSON.parse(rawdata);
const networkData = contract["networks"][chainId.toString()];
const instance = new ethereum.Contract(contract.abi, networkData["address"]);
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
    sendDiceToOracle(yahtaddr, shallowDice);
}

async function sendDiceToOracle(yahtAddr, dice) {
    const query = instance.methods.rec_dice_roll(yahtAddr, dice[0], dice[1], dice[2], dice[3], dice[4]);
    const encodedABI = query.encodeABI();    
    const signedTx = await ethereum.accounts.signTransaction(
        {
            data: encodedABI,
            from: ACCOUNT,
            gas: 3000000,
            gasPrice: 2000000000,
            to: instance.options.address,
        },
        KEY,
        false,
    );
    await ethereum.sendSignedTransaction(signedTx.rawTransaction);
}


let options = {};
instance.events.GenerateDie(options).on('data', (ev) => eventHandler(ev));
instance.events.GenerateDie(options).on('connected', (ev) => console.log("connected"));
