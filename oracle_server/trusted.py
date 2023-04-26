from web3 import Web3
import asyncio
import json

oracle_addr = "0xE9Bc1552547E8F03c39f526209677E2147fb6ccF"
oracle_key = "0x5b2088fd456c3387e5237d741c6c428d910fa871a444a10f46ea0fb4768ad08b"

w3 = Web3(Web3.WebsocketProvider('ws://127.0.0.1:8545'))

f = open('./build/contracts/DieOracle.json')
chainId = w3.eth.chain_id
data = json.load(f)
contractAddr = data["networks"][str(chainId)]["address"]
contract = w3.eth.contract(address=contractAddr, abi=data["abi"])


# signed_txn = w3.eth.sign_transaction(dict(
#     nonce=w3.eth.get_transaction_count(w3.eth.coinbase),
#     maxFeePerGas=2000000000,
#     maxPriorityFeePerGas=1000000000,
#     gas=100000,
#     to=contractAddr
#     )
# )

def handle_event(event):
    print("got event")
    print(Web3.toJSON(event))

async def log_loop(event_filter, poll_interval):
    while True:
        print('listening'
        )
        for GenerateDie in event_filter.get_new_entries():
            handle_event(GenerateDie)
        await asyncio.sleep(poll_interval)


def main():
    event_filter = contract.events.GenerateDie
    #block_filter = web3.eth.filter('latest')
    # tx_filter = web3.eth.filter('pending')
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(asyncio.gather(log_loop(event_filter, 2)))
                # log_loop(block_filter, 2),
                # log_loop(tx_filter, 2)))
    finally:
        # close loop to free up system resources
        loop.close()


if __name__ == "__main__":
    main()