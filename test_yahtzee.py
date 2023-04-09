import pytest
from eth_tester.exceptions import TransactionFailed

@pytest.fixture
def yahtzee_contract(w3, get_vyper_contract):
    with open("yahtzee.vy", encoding='utf-8') as infile:
        contract_code = infile.read()
    args = [w3.eth.accounts[0], w3.eth.acounts[1]]
    return get_vyper_contract(contract_code, *args)