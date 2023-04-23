import React, {useState, useEffect} from 'react';
import './App.css';
import Scoreboard from './Components/Scoreboard/Scoreboard';
import Dice from './Components/Dice/Dice';
import Actions from './Components/Actions/Actions';
// import { MetamaskStateProvider, useMetamask } from "use-metamask";
import Yahtzee from './Services/API';



function App() {

  const [yahtzee, ] = useState<Yahtzee>(new Yahtzee());

  const [selected, setSelected] = useState<boolean[]>([true, true, true, true, true]);

  const [player, setPlayer] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);

  // let web3 = new Web3("https://127.0.0.1:7545");

  useEffect(() => {
    yahtzee.dumpScore().then(() => {
      yahtzee.dumpTurn().then(() => {
        setLoading(false);
      });
    });
  })

  const players = ['0x5dc6E6684BAE748e28CC80078c9E88Cb16aC72f1',
      '0x103Ce0301b23A364084Db2f1F1D3A203CDCDf819'];

  function isInGameFirst(): boolean {
    return (players[player] === yahtzee.state.player1 || players[player] === yahtzee.state.player2) 
      && yahtzee.emptyAdd === yahtzee.state.player2;
  }

  function isInStartedGame(): boolean {
    return (players[player] === yahtzee.state.player1 || players[player] === yahtzee.state.player2)
      && yahtzee.state.turn !== yahtzee.emptyAdd;
  }

  function notInGame(): boolean {
    return (players[player] !== yahtzee.state.player1 && players[player] !== yahtzee.state.player2
      && yahtzee.state.turn !== yahtzee.emptyAdd)
  }

  
  return (
    // <MetamaskStateProvider>
    <div className="App">
      <header className="App-header">

            <h1>Blockchain Yahtzee</h1>
            <button onClick={() => {setPlayer((player + 1) % 2)}}>player: {player}</button>

            { 
              loading ? null :
              notInGame() ? <div>Game in progress, please wait for the next game to start.</div> :
              isInGameFirst() ? <div> Waiting for other player to join</div> : 
              isInStartedGame() ? 
              <div>
                <Scoreboard yahtzee={yahtzee} selected={selected} addy={players[player]}/>
                <Dice state={yahtzee.state} selected={selected} setSelected={setSelected}/>
                <Actions yahtzee={yahtzee} selected={selected} address={players[player]}></Actions>
              </div> 
              :
              <button onClick={() => {yahtzee.joinGame(players[player])}}>Join game</button>
            }
            
         
      
      </header>
    </div>
    // </MetamaskStateProvider>
  );
}

export default App;
