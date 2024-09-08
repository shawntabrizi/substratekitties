import { Grid, Theme } from "@radix-ui/themes";
import { AccountSelector } from "./account-selector";
import { KittyProvider } from "./context/kitty-context";
import { KittyList } from "./kitty-list";
import { MarketplaceList } from "./marketplace-list";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectButton } from "./connect-button";
import { Toaster } from "sonner";
import { MintKitty } from "./mint-kitty";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Theme>
        <KittyProvider>
          <main className="p-4">
            <h1 className="pb-8 text-2xl font-bold">Substrate Kitties</h1>
            <Grid gap="4" columns="1">
              <ConnectButton />
              <AccountSelector />
              <MintKitty />
              <KittyList />
              <MarketplaceList />
            </Grid>
          </main>
          <Toaster />
        </KittyProvider>
      </Theme>
    </QueryClientProvider>
  );
}
