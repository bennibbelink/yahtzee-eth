export interface State {
    player1: string
    player2: string
    rollsLeft: number
    dice: number[]
    turn: number
    player1_scores: (number|null)[]
    player2_scores: (number|null)[]
}
