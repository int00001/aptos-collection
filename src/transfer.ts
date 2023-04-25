import { AptosAccount, AptosClient, CoinClient, FaucetClient } from 'aptos';

import { TESTNET_FAUCET_URL, TESTNET_NODE_URL } from 'config';
import { loadAccount } from 'load-acc';

const main = async () => {
  const client = new AptosClient(TESTNET_NODE_URL);
  const faucetClient = new FaucetClient(TESTNET_NODE_URL, TESTNET_FAUCET_URL);
  const coinClient = new CoinClient(client);

  // load key
  const acc = loadAccount();
  // create new acc
  const acc2 = new AptosAccount();

  console.log(acc.address().hex());
  console.log(acc2.address().hex());

  await faucetClient.fundAccount(acc.address(), 100_000_000);
  await faucetClient.fundAccount(acc2.address(), 0); // inits acc

  // get balances before transfer
  console.log(`1: ${await coinClient.checkBalance(acc)}`);
  console.log(`2: ${await coinClient.checkBalance(acc2)}`);

  // transfer
  const hash = await coinClient.transfer(acc, acc2, 1_000, {
    gasUnitPrice: BigInt(100),
  });
  console.log(hash);
  await client.waitForTransaction(hash);

  // get balances after transfer
  console.log(`1: ${await coinClient.checkBalance(acc)}`);
  console.log(`2: ${await coinClient.checkBalance(acc2)}`);
};

main();
