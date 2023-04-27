import {
  AptosAccount,
  AptosClient,
  BCS,
  FaucetClient,
  TxnBuilderTypes,
} from 'aptos';

import { aptosCoinStore, TESTNET_FAUCET_URL, TESTNET_NODE_URL } from 'config';
import { loadAccount } from 'utils';

const {
  ChainId,
  StructTag,
  TypeTagStruct,
  EntryFunction,
  AccountAddress,
  RawTransaction,
  TransactionPayloadEntryFunction,
} = TxnBuilderTypes;

const getAccountBalance = async (
  client: AptosClient,
  account: AptosAccount
) => {
  const resources = await client.getAccountResources(account.address());
  const aptosCoinResource = resources.find((r) => r.type === aptosCoinStore);
  const resourceData = aptosCoinResource?.data as any;
  return parseInt(resourceData.coin.value, 10);
};

const main = async () => {
  const client = new AptosClient(TESTNET_NODE_URL);
  const faucetClient = new FaucetClient(TESTNET_NODE_URL, TESTNET_FAUCET_URL);

  const account = loadAccount();
  const account2 = new AptosAccount();
  await faucetClient.fundAccount(account2.address(), 0);

  console.log(`acc 1: ${await getAccountBalance(client, account)}`);
  console.log(`acc 2: ${await getAccountBalance(client, account2)}`);

  // create tx payload
  const token = new TypeTagStruct(
    StructTag.fromString('0x1::aptos_coin::AptosCoin')
  );
  const entryFunctionPayload = new TransactionPayloadEntryFunction(
    EntryFunction.natural(
      // AccountAddress::ModuleName
      '0x1::coin',
      // module function
      'transfer',
      // coin type to transfer (phantom generic for this module)
      [token],
      // arguments for transfer
      [
        BCS.bcsToBytes(AccountAddress.fromHex(account2.address())),
        BCS.bcsSerializeUint64(700),
      ]
    )
  );

  // get sequence
  const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
    client.getAccount(account.address()),
    client.getChainId(),
  ]);

  // tx
  const rawTx = new RawTransaction(
    // sender
    AccountAddress.fromHex(account.address()),
    // sequence
    BigInt(sequenceNumber),
    // payload
    entryFunctionPayload,
    // max gas unit to spend
    BigInt(2000),
    // gas price per unit
    BigInt(100),
    // tx expiration. discard after X time
    BigInt(Math.floor(Date.now() / 1000) + 10),
    // chain id
    new ChainId(chainId)
  );

  // sign tx
  const bcsTx = AptosClient.generateBCSTransaction(account, rawTx);

  // send
  const res = await client.submitSignedBCSTransaction(bcsTx);
  await client.waitForTransaction(res.hash);

  console.log(`acc 1: ${await getAccountBalance(client, account)}`);
  console.log(`acc 2: ${await getAccountBalance(client, account2)}`);
};

main();
