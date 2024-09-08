import { Grid, Theme } from "@radix-ui/themes";
import { AccountSelector } from "./account-selector";
import { KittyProvider } from "./context/kitty-context";
import { KittyList } from "./kitty-list";
import { MarketplaceList } from "./marketplace-list";

export default function App() {
  return (
    <Theme>
      <KittyProvider>
        <main className="p-4">
          <h1 className="pb-8 text-2xl font-bold">Substrate Kitties</h1>
          <Grid gap="4" columns="1">
            <AccountSelector />
            <KittyList />
            <MarketplaceList />
          </Grid>
        </main>
      </KittyProvider>
    </Theme>
  );
}
