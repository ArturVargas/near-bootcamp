import { Context, logging, storage, PersistentMap, u128 } from 'near-sdk-as'

const approves = new PersistentMap<string, u64>("approve:");
const balanceRegistry = new PersistentMap<string, u128>("balance:");
const totalSupply = new PersistentMap<string, u128>("totalSupply:");
const OPERATION_ERR = 'Error en la Operacion';

export function init(name: string, symbol: string, initialSupply: u128, decimals: u8): void {
  // predecessor es un string del ultimo accountId que firmo la tx
  logging.log("owner: " + Context.predecessor);
  assert(storage.get("init") == null, "El token ya fue minteado");

  // nombre del token
  storage.set("tokenName", name);
  // simbolo del token
  storage.set("tokenSymbol", symbol);
  // total supply
  storage.set("totalSupply", initialSupply);
  // num de decimales del token
  storage.set("decimals", decimals);

  // se asigna el total supply a la cuenta del owner
  balanceRegistry.set(Context.predecessor, initialSupply);
  storage.set<string>("owner", Context.predecessor);

  //function init done
  storage.set<string>("init", "done")
}

export function getTotalSupply(): u128 {
  return totalSupply.getSome('totalSupply');
}

export function getTokenName(): string {
  return storage.getSome<string>("tokenName");
}

export function getTokenSymbol(): string {
  return storage.getSome<string>("tokenSymbol")
}

export function getBalance(owner: string): u128 {
  assert(balanceRegistry.contains(owner), "Cuenta Invalida")
  return balanceRegistry.getSome(owner);
}

// Context.sender es la cuenta que envia la tx
export function approve(spender: string, amount: u64): boolean {
  logging.log("approve: " + spender + ", amount: " + amount.toString());
  approves.set(Context.sender + ": " + spender, amount);
  return true;
}

export function transfer(to: string, amount: u128): boolean {
  logging.log("transferFrom: " + Context.sender + " to: " + to + " amount: " + amount.toString());
  const fromAmount = getBalance(Context.sender);
  assert(fromAmount >= amount, "No tienes suficientes tokens en tu cuenta");
  assert(getBalance(to) <= getBalance(to) + amount, "Error");
  balanceRegistry.set(Context.sender, fromAmount - amount);
  balanceRegistry.set(to, getBalance(to) + amount);
  return true;
}