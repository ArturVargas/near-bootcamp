import { Context, logging, storage, PersistentMap, u128 } from 'near-sdk-as'

const approves = new PersistentMap<string, u128>("approve:");
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

export function allowance(owner: string, spender: string): u128 {
  const key = owner + ":" + spender;
  if(approves.contains(key)) {
    return approves.getSome(key);
  }
  return u128.Zero;
}
// Context.sender es la cuenta que envia la tx
export function approve(spender: string, amount: u128): boolean {
  logging.log("approve: " + spender + ", amount: " + amount.toString());
  approves.set(Context.sender + ": " + spender, amount);
  return true;
}

export function transfer(to: string, amount: u128): boolean {
  logging.log("transferFrom: " + Context.sender + " to: " + to + " amount: " + amount.toString());
  const fromAmount = getBalance(Context.sender);
  assert(fromAmount >= amount, "No tienes suficientes tokens en tu cuenta");
  assert(getBalance(to) <= u128.add(getBalance(to), amount), "Error");
  balanceRegistry.set(Context.sender, u128.sub(fromAmount, amount));
  balanceRegistry.set(to, u128.add(getBalance(to), amount));
  return true;
}

export function transferFrom(from: string, to: string, amount: u128): boolean {
  const fromAmount = getBalance(from);
  assert(fromAmount >= amount, "Saldo insuficiente");
  const approvedAmount = allowance(from, to);
  assert(approvedAmount >= amount, "Monto enviado menor al aprobado");
  assert(getBalance(to) <= u128.add(getBalance(to), amount), "Error");
  balanceRegistry.set(from, u128.sub(fromAmount, amount));
  balanceRegistry.set(to, u128.add(getBalance(to), amount));
  return true;
}

export function mint(tokens: u128): boolean {
  assert(storage.getSome("owner"), OPERATION_ERR)
  let currentSupply = totalSupply.getSome("totalSupply");
  totalSupply.set("totalSupply", u128.add(currentSupply, tokens));
  let currentBalance = getBalance(Context.predecessor);
  balanceRegistry.set(Context.predecessor, u128.add(currentBalance, tokens));
  return true;
}
