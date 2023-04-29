/* eslint-disable no-await-in-loop */

import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';
import { AptosAccount, FaucetClient } from 'aptos';
import { TESTNET_FAUCET_URL, TESTNET_NODE_URL } from 'config';

dotenv.config();

const ACCOUNT_NAMES = ['token_swap', 'dev', 'default_admin'];

async function createAccountFiles(
  directory: string,
  fileName: string,
  content: string
): Promise<void> {
  try {
    fs.mkdirSync(directory, { recursive: true });
    const filePath = path.join(directory, fileName);
    await fs.promises.writeFile(filePath, content);
  } catch (error) {
    console.error(`Error creating file: ${error}`);
  }
}

const main = async () => {
  const faucetClient = new FaucetClient(TESTNET_NODE_URL, TESTNET_FAUCET_URL);

  for (const accountName of ACCOUNT_NAMES) {
    const account = new AptosAccount();
    const accountData = account.toPrivateKeyObject();

    await faucetClient.fundAccount(account.address(), 100_000_000);

    await createAccountFiles(
      process.env.KEY_DIR!,
      `${accountName}.key.pub`,
      `${accountData.publicKeyHex}`
    );
    await createAccountFiles(
      process.env.KEY_DIR!,
      `${accountName}.key`,
      `${accountData.privateKeyHex}`
    );

    console.log(
      `account addr ${accountData.address} created for ${accountName}`
    );
  }
};

main();
