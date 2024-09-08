import { Grid, Theme } from "@radix-ui/themes";
import { AccountSelector } from "./account-selector";
import {
  KittyProvider,
  useKittyContext,
  type KittyForSale,
} from "./context/kitty-context";
import { KittyList } from "./kitty-list";
import { MarketplaceList } from "./marketplace-list";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectButton } from "./connect-button";
import { Toaster } from "sonner";
import { MintKitty } from "./mint-kitty";
import { ss58Decode } from "@polkadot-labs/hdkd-helpers";

const queryClient = new QueryClient();

export default function App() {
  const {
    kittiesOwned,
    selectedAccount,
    setSelectedAccount,
    kitties,
    polkadotSigner,
  } = useKittyContext();

  const accountsWithKitties = Object.keys(kittiesOwned);
  const kittiesForSale = kitties.filter(
    (kitty) => kitty.price !== undefined && kitty.owner !== selectedAccount
  ) as KittyForSale[];
  const kittiesOwnedBySelectedAccount = kitties.filter(
    (kitty) => kitty.owner === selectedAccount
  );
  const isUserSelectedAccount =
    polkadotSigner !== undefined && selectedAccount !== undefined
      ? polkadotSigner.publicKey.toString() ===
        ss58Decode(selectedAccount)[0].toString()
      : false;

  return (
    <QueryClientProvider client={queryClient}>
      <Theme>
        <KittyProvider>
          <main className="p-4">
            <h1 className="pb-8 text-2xl font-bold">Substrate Kitties</h1>
            <Grid gap="4" columns="1">
              <ConnectButton />
              <AccountSelector
                accounts={accountsWithKitties}
                selectedAccount={selectedAccount}
                setSelectedAccount={setSelectedAccount}
              />
              <MintKitty />
              <KittyList
                kitties={kittiesOwnedBySelectedAccount}
                selectedAccount={selectedAccount}
                isUserSelectedAccount={isUserSelectedAccount}
              />
              <MarketplaceList kittiesForSale={kittiesForSale} />
            </Grid>
          </main>
          <Toaster />
        </KittyProvider>
      </Theme>
    </QueryClientProvider>
  );
}
