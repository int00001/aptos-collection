import { AptosClient } from 'aptos';

import { TESTNET_NODE_URL } from 'config';

const main = async () => {
  const client = new AptosClient(TESTNET_NODE_URL);

  const baseAddr = '0x1';
  const modules = await client.getAccountModules(baseAddr);
  console.log(modules.length);

  // for (const mod of modules) {
  //   console.log(mod.abi?.name);
  //   console.log(mod.abi?.exposed_functions);
  // }

  // can see module fns and structs if abi is present
  // otherwise just module's bytecode
  const coinModule = modules.find((m) => m.abi?.name === 'aptos_coin');
  console.log(coinModule?.abi?.exposed_functions);
  console.log(coinModule?.abi?.structs);
};

main();
