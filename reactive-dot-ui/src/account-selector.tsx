import { Select } from "@radix-ui/themes";
import { useAccounts } from "@reactive-dot/react";
import { PolkadotIdenticon } from "dot-identicon/react.js";
import { useSelectedAccountState } from "./hooks/use-selected-account";

export function AccountSelector() {
  const accounts = useAccounts();
  const [selectedAccount, setSelectedAccount] = useSelectedAccountState();

  return (
    <Select.Root
      value={selectedAccount?.address}
      onValueChange={(address) => {
        const newAccount = accounts.find(
          (account) => account.address === address
        );
        if (newAccount !== undefined) {
          setSelectedAccount(newAccount);
        }
      }}
    >
      <Select.Trigger placeholder="Select an account to view it's kitties" />
      <Select.Content>
        <Select.Group>
          <Select.Label>Accounts</Select.Label>
          {accounts.map((account) => (
            <Select.Item key={account.address} value={account.address}>
              <PolkadotIdenticon address={account.address} size={16} />
              <span>{account.name ?? account.address}</span>
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}
