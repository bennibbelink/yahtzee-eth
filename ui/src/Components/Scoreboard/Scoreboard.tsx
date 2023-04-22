import React, { FC } from 'react';
import { ScoreboardWrapper } from './Scoreboard.styled';
import {Column, Accessor} from 'react-table'
import {State} from '../../Types'
import Table from '../Table/Table'

interface ScoreboardProps {
   state: State
   selected: boolean[]
}

const Scoreboard: FC<ScoreboardProps> = (props: ScoreboardProps) => {

   // 15 categories: 13 + bonus and total
   let categories: string[] = [
      'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes', 'Bonus',
      '3 of a kind', '4 of a kind', 'Full house', 'SM straight', 'LG straight',
      'Yahtzee', 'Chance', 'Total'
   ];

   let data = Array(15);
   for (let i = 0; i < categories.length; i++) {
      data[i] = {
         'category': categories[i], 
         'player1':  props.state.player1_scores[i],
         'player2': props.state.player2_scores[i]
      }
   }
   let columns: Column[] = [
      { Header: 'Category', accessor: 'category' },
      { Header: `Player 1: ${props.state.player1}`, accessor: 'player1' },
      { Header: `Player 2: ${props.state.player2}`, accessor: 'player2' }
   ];


   return (

      <ScoreboardWrapper>
         <Table columns={columns} data={data} selected={props.selected}/>
      </ScoreboardWrapper>
   );

   }

export default Scoreboard;
