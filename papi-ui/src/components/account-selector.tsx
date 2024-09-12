import Identicon from "@polkadot/react-identicon";
import { Select } from "@radix-ui/themes";

interface Props {
  accounts: string[];
  selectedAccount?: string;
  setSelectedAccount: (account: string) => void;
}

export function AccountSelector({
  accounts,
  selectedAccount,
  setSelectedAccount,
}: Props) {
  return (
    <Select.Root
      onValueChange={(newAccount) => setSelectedAccount(newAccount)}
      value={selectedAccount}
    >
      <Select.Trigger placeholder="Select an account to view it's kitties" />
      <Select.Content>
        <Select.Group>
          <Select.Label>Accounts</Select.Label>
          {accounts.map((account) => (
            <Select.Item key={account} value={account}>
              <Identicon value={account} size={16} theme="polkadot" />
              <span>{account}</span>
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}
