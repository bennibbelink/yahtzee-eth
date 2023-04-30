# yahtzee-eth

A smart contract for the popular dice game Yahtzee.

## How to deploy to a local blockchain
1. Start a local blockchain network (has been tested on Ganache and Hardhat)
2. `npm i`
3. `truffle deploy --reset --network development`. If your RPC server URL is not `http://127.0.0.1:8545` then you will need to update `truffle-config.js`.
4. `PROVIDER="{RPC server URL}" ORACLE_ACCOUNT="{address here}" ORACLE_KEY="{private key here}" node oracle_server.js`. Make sure
to use a websocket URL to avoid latency from http polling (e.g. `ws://127.0.0.1:8545`).  If the server connects to the blockchain
correcly there should be output indicating that it has connected.
5. Now your contracts should be deployed on your network and the "trusted" oracle server should be running.

If you wish to deploy on a non-local network then update your `truffle-config.js` and skip step 1.  I have not tested deploying
to a testnet such as Goerli or Sepolia.

## Yahtzee.vy
This is the smart contract that governs the game.  It maintains the game state as public storage variables, 
however it was designed to emit events on state changes for a front end to listen for. It must be initialized
with the address of the oracle as an argument.  This is so that there is no need to provide the oracle address
after initialization, and to ensure that an oracle exists on creation of the Yahtzee contract.

```
interface Yahtzee:
    def join_game(): nonpayable
    def toggle_select_die(ind: uint8): nonpayable
    def roll_dice(): nonpayable
    def bank_roll(category: uint32): nonpayable
    def turn_dump(): view
    def dice_dump(): view
    def score_dump(): view
    def recieve_dice_roll(one: int8, two: int8, three: int8, four: int8, five: int8): nonpayable
    def game_start_time() -> uint256: view
```

## DieOracle.vy
This is the smart contract that conveys information to some off-chain (trusted) server so that a random
dice roll can be generated.  Currently I run a lightweight server (oracle_server.js) locally that listens for GenerateDie events
and when it receieves one it generates a random roll (of the selected dice) and calls rec_dice_roll to return
the roll to this smart contract (which then calls Yahtzee:recieve_dice_roll() to pass the info along to the game).

The event emitted by the oracle include the `msg.sender` i.e. the Yahtzee contract address.  This is then passed back 
to the oracle via rec_dice_roll from the server, so the oracle knows where to send the dice roll to.  This way the oracle could
potentially be used by multiple smart contracts that need random dice.

Currently there is no authentication mechanism in place to ensure that calls to rec_dice_roll() are from the trusted server,
so anybody (untrusted) could make a call to the oracle contract and manipulate the game contract (assuming that they pass 
the Yahtzee contract address as sender_arr).  To mitigate this a simple check in rec_dice_roll() can be made 
(e.g. `assert(msg.sender == "trusted address"`) to ensure that the call is coming from our trusted server, however since the 
trusted server address is continually changing in development this check was left out for simplicity.  **This check should be 
in place before deploying to a public chain.**

```
interface DieOracle:
    def gen_dice_roll(one: int8, two: int8, three: int8, four: int8, five: int8): nonpayable
    def rec_dice_roll(sender_addr: address, one: int8, two: int8, three: int8, four: int8, five: int8): nonpayable
```

## Tests
The tests (in ./test directory) were originally written for a much older version of the Yahtzee contract.
They are out of date.  I will leave them in this repo for reference if I choose to update them later.