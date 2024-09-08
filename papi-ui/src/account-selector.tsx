import { Select } from "@radix-ui/themes";
import Identicon from "@polkadot/react-identicon";
import { useKittyContext } from "./context/kitty-context";
import { data } from "./context/data";

export function AccountSelector() {
  const { selectedAccount, setSelectedAccount } = useKittyContext();

  console.log(selectedAccount);

  return (
    <Select.Root
      onValueChange={(newAccount) => setSelectedAccount(newAccount)}
      value={selectedAccount}
    >
      <Select.Trigger placeholder="Select an account" />
      <Select.Content>
        <Select.Group>
          <Select.Label>Accounts</Select.Label>
          {Object.keys(data.kittiesOwned).map((account) => (
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
