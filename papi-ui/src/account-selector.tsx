import Identicon from "@polkadot/react-identicon";
import { Select } from "@radix-ui/themes";
import { useKittyContext } from "./context/kitty-context";

export function AccountSelector() {
  const { selectedAccount, setSelectedAccount, kittiesOwned } =
    useKittyContext();

  return (
    <Select.Root
      onValueChange={(newAccount) => setSelectedAccount(newAccount)}
      value={selectedAccount}
    >
      <Select.Trigger placeholder="Select an account to view it's kitties" />
      <Select.Content>
        <Select.Group>
          <Select.Label>Accounts</Select.Label>
          {Object.keys(kittiesOwned).map((account) => (
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
