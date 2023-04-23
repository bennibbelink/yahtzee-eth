import React, { FC } from 'react';
import { DiceWrapper, DieWrapper } from './Dice.styled';
import { State } from '../../Types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDiceOne, faDiceTwo, faDiceThree, 
   faDiceFour, faDiceFive, faDiceSix} from '@fortawesome/free-solid-svg-icons'


interface DiceProps {
   state: State
   selected: boolean[]
   setSelected: React.Dispatch<React.SetStateAction<boolean[]>>
}

const Dice: FC<DiceProps> = (props: DiceProps) => {
   
   return (
      <DiceWrapper>
         { props.state.dice.map((d, i) => (
            <div key={i} onClick={() => onclick(i)}>
               <Die value={d} selected={props.selected[i]}/>
            </div>
            ))
         }
      </DiceWrapper>
   );

   function onclick(ind: number) {
      let copy: boolean[] = []
      for (let i = 0; i < props.selected.length; i++) {
         copy.push(props.selected[i]);
      }
      copy[ind] = !copy[ind]
      props.setSelected(copy)
   }
}


interface DieProps {
   value: number
   selected: boolean
}
const Die: FC<DieProps> = (props: DieProps) => {
   let icon = null;
   switch(props.value) {
      case 1:
         icon = faDiceOne; break;
      case 2:
         icon = faDiceTwo; break;
      case 3:
         icon = faDiceThree; break;
      case 4:
         icon = faDiceFour; break;
      case 5:
         icon = faDiceFive; break;
      case 6:
         icon = faDiceSix; break;
      default:
         icon = faDiceOne; break;
   }
   return (
      <DieWrapper>
            <FontAwesomeIcon icon={icon} size={'2xl'} style={props.selected ? {} : {'border': 'solid gray 2px'}}></FontAwesomeIcon>
      </DieWrapper>
   );
}

export default Dice;
