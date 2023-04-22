import React, {useState, useEffect} from 'react';
import './App.css';
import Scoreboard from './Components/Scoreboard/Scoreboard';
import { State } from './Types';
import Dice from './Components/Dice/Dice';
import Actions from './Components/Actions/Actions';
import { MetamaskStateProvider, useMetamask } from "use-metamask";
import Web3 from 'web3'

function App() {



  const fakeState : State = {
    player1: '0xabcd',
    player2: '0xcafe',
    rollsLeft: 3,
    dice: Array(5).fill(6),
    turn: 0,
    player1_scores: Array(15).fill(null),
    player2_scores: Array(15).fill(null)
  }

  const [selected, setSelected] = useState<boolean[]>([false, false, false, false, false]);
  const {connect, metaState} = useMetamask();

  useEffect(() => {
  })

  return (
    <MetamaskStateProvider>
    <div className="App">
      <header className="App-header">
      <h1>Blockchain Yahtzee</h1>
        <Scoreboard state={fakeState} selected={selected}/>
        <Dice state={fakeState} selected={selected} setSelected={setSelected}/>
        <Actions></Actions>
      </header>
    </div>
    </MetamaskStateProvider>
  );
}

export default App;
