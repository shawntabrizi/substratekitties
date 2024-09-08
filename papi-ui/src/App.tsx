import { Theme } from "@radix-ui/themes";
import { AccountSelector } from "./account-selector";
import { KittyProvider, useKittyContext } from "./context/kitty-context";
import { KittyList } from "./kitty-list";
import { MarketplaceList } from "./marketplace-list";

export default function App() {
  const { selectedAccount } = useKittyContext();

  return (
    <Theme>
      <KittyProvider>
        <main className="p-4">
          <h1 className="text-2xl font-bold">Substrate Kitties</h1>
          <AccountSelector />
          {selectedAccount && (
            <>
              <KittyList account={selectedAccount} />
              <MarketplaceList account={selectedAccount} />
            </>
          )}
        </main>
      </KittyProvider>
    </Theme>
  );
}
