import React, { FC } from 'react';
import { ActionsWrapper } from './Actions.styled';
import { Button } from './Actions.styled'
import Yahtzee from '../../Services/API';

interface ActionsProps {
   yahtzee: Yahtzee
   selected: boolean[]
   address: string
}

const Actions: FC<ActionsProps> = (props: ActionsProps) => {
   return(
      <ActionsWrapper>
         <Button onClick={handleClick}>Roll Dice</Button>
      </ActionsWrapper>
   );

   async function handleClick() {
      await props.yahtzee.rollDice(props.selected, props.address);
   }

}
 


export default Actions;
