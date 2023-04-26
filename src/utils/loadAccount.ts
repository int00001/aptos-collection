import fs from 'fs';

import { AptosAccount, HexString } from 'aptos';
import * as dotenv from 'dotenv';

dotenv.config();

export const loadAccount = () => {
  const rawdata = fs.readFileSync(process.env.KEY_PATH!);
  const keyData = rawdata.toString();
  const hexString = new HexString(keyData);
  return new AptosAccount(hexString.toUint8Array());
};
