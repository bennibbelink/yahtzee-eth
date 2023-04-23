
import Web3 from 'web3'

import { State } from '../Types';


export default class Yahtzee {

    emptyAdd = "0x0000000000000000000000000000000000000000";
    contractAddress = "0x9D7d2d175C27aa5D9BF03bf4cB3E1B2482D77Dcd";
    instance: any;

    state: State = {
        player1: this.emptyAdd,
        player2: this.emptyAdd,
        rollsLeft: 3,
        dice: Array(5).fill(6),
        turn: this.emptyAdd,
        player1_scores: Array(15).fill(null),
        player2_scores: Array(15).fill(null)
    };

    constructor() {
        let web3 = new Web3('ws://127.0.0.1:7545');
        const abi = require('../ContractABI/Yahtzee.json');
        this.instance = new web3.eth.Contract(abi.abi, this.contractAddress);
        let options = {};
        this.instance.events.Turn(options)
            .on('data', (ev: any) => { this.turnHandler(ev); });
        this.instance.events.DiceState(options)
            .on('data', (ev: any) => { this.diceStateHandler(ev); });
        this.instance.events.ScoreState(options)
            .on('data', (ev: any) => { this.scoreStateHandler(ev); });
        this.instance.events.GameOver(options)
            .on('data', (ev: any) => { this.gameOverHandler(ev); });
    }

    diceStateHandler(ev: any) {
        console.log("DiceState event recieved")
        this.state.dice = ev.returnValues.dice;
    }

    scoreStateHandler(ev: any) {
        console.log("ScoreState event recieved")
        this.state.player1 = ev.returnValues.players[0];
        this.state.player2 = ev.returnValues.players[1];
        for (let i = 0; i < ev.returnValues.player_scores.length; i++) {
            this.state.player1_scores[i] = parseInt(ev.returnValues.player_scores[i][0]);
            this.state.player2_scores[i] = parseInt(ev.returnValues.player_scores[i][1]);
        }
    }

    gameOverHandler(ev: any) {
        console.log('GameOver event recieved');
    }

    turnHandler(ev: any) {
        console.log('Turn event recieved');
        this.state.turn = ev.returnValues.turn;
    }

    async dumpScore() {
        await this.instance.methods.score_dump().send({from: '0x103Ce0301b23A364084Db2f1F1D3A203CDCDf819', gas: 3000000})
    }

    async dumpTurn() {
        await this.instance.methods.turn_dump().send({from: '0x103Ce0301b23A364084Db2f1F1D3A203CDCDf819', gas: 3000000})
    }

    async rollDice(dice_indices: boolean[], addy: string) {
        let di = dice_indices;
        return new Promise(async (resolve, reject) => {
            console.log("sending roll_dice")
            await this.instance.methods.roll_dice(di[0], di[1], di[2], di[3], di[4]).send({from: addy, gas: 3000000});
        });
    }

    async bankRoll(category: number, addy: string) {
        return new Promise(async (resolve, reject) => {
            console.log("sending bank_roll")
            await this.instance.methods.bank_roll(category).send({from: addy, gas: 3000000});
        });
    }

    async joinGame(addy: string) {
        return new Promise(async (resolve, reject) => {
            console.log("sending join_game")
            let res = await this.instance.methods.join_game().send({from: addy, gas: 3000000});
            console.log(res);
        });
    }

}


