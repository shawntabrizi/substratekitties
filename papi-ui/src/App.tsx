import { ss58Encode } from "@polkadot-labs/hdkd-helpers";
import { Grid, Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AccountSelector } from "./components/account-selector";
import { ConnectButton } from "./components/connect-button";
import { KittyProvider } from "./context/kitty-context";
import { useKittyContext } from "./context/use-kitty-context";
import { KittyList } from "./components/kitty-list";
import { MarketplaceList } from "./components/marketplace-list";
import { MintKitty } from "./components/mint-kitty";
import { type KittyForSale } from "./types";

const queryClient = new QueryClient();

function Page() {
  const {
    kittiesOwned,
    selectedAccount,
    setSelectedAccount,
    kitties,
    polkadotSigner,
  } = useKittyContext();

  const accountsWithKitties = Object.keys(kittiesOwned);
  const kittiesForSale = kitties.filter(
    (kitty) =>
      kitty.price !== undefined &&
      // If the user is not connected, we show all the kitties for sale
      // If the user is connected, we only show the kitties for sale that are not owned by the user
      (polkadotSigner === undefined ||
        kitty.owner !== ss58Encode(polkadotSigner.publicKey, 0))
  ) as KittyForSale[];
  const kittiesOwnedBySelectedAccount = kitties.filter(
    (kitty) => kitty.owner === selectedAccount
  );
  const isUserSelectedAccount =
    polkadotSigner !== undefined && selectedAccount !== undefined
      ? selectedAccount === ss58Encode(polkadotSigner.publicKey, 0)
      : false;

  return (
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
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Theme>
        <KittyProvider>
          <Page />
          <Toaster />
        </KittyProvider>
      </Theme>
    </QueryClientProvider>
  );
}
