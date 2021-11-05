import { Context, logging, storage, PersistentMap } from 'near-sdk-as'

const balance = new PersistentMap<string, u64>("balance:");
const approve = new PersistentMap<string, u64>("approve:");

const TOTAL_SUPPLY: u64 = 1000000;

export function init(owner: string): void {
  logging.log("owner: " + owner);
  if(storage.get("init")) {
    balance.set(owner, TOTAL_SUPPLY);
    storage.set("init", "done");
  }
}

export function totalSupply(): string {
  return TOTAL_SUPPLY.toString();
}

export function balanceOf(userAddress: string): u64 {
  logging.log("balanceOf: " + userAddress);
  if(!balance.contains(userAddress)) {
    return 0;
  }
  const result = balance.getSome(userAddress);
  return result;
}
