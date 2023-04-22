import React, { FC } from 'react';
import { ActionsWrapper } from './Actions.styled';
import { Button } from './Actions.styled'

interface ActionsProps {}

const Actions: FC<ActionsProps> = () => (
 <ActionsWrapper>
    <Button>Roll Dice</Button>
 </ActionsWrapper>
);

export default Actions;
