import { AptosClient } from 'aptos';

import { TESTNET_NODE_URL } from 'config';
import { loadAccount } from 'utils';

const main = async () => {
  const client = new AptosClient(TESTNET_NODE_URL);
  const account = loadAccount();

  // all resources belonging to account
  const resources = await client.getAccountResources(account.address());
  console.log(resources);

  // aptos coin resource
  const aptosCoinStore = '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>';
  const resource = resources.find((r) => r.type === aptosCoinStore);
  const resourceData = resource?.data as any;
  const balance = resourceData.coin.value;

  console.log(balance);
  console.log(resourceData.coin);
  console.log(resourceData.deposit_events);
  console.log(resourceData.withdraw_events);
};

main();
