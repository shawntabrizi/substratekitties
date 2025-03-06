import { WalletAccount } from "@reactive-dot/core/wallets.js";
import { useAccounts } from "@reactive-dot/react";
import { createContext, useContext } from "react";

export const SelectedAccountStateContext = createContext([
  undefined as WalletAccount | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (account: WalletAccount) => {},
] as const);

export function useSelectedAccountState() {
  const accounts = useAccounts();
  const [account, setAccount] = useContext(SelectedAccountStateContext);

  return [
    account === undefined ||
    !accounts.some((x) => x.address === account.address)
      ? undefined
      : account,
    setAccount,
  ] as const;
}
