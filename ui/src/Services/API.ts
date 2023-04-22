import detectEthereumProvider from "@metamask/detect-provider";

export async function rollDice(dice_indices: number[]) {
    return new Promise((resolve, reject) => {
        
    });
}

export async function bankRoll(category: number) {
    return new Promise(async (resolve, reject) => {
        const provider = await detectEthereumProvider();
        console.log(provider)
    });
}


export async function getState() {
    const provider = await detectEthereumProvider();

}
