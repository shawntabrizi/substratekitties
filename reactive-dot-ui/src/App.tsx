import { Grid, Theme } from "@radix-ui/themes";
import { pending } from "@reactive-dot/core";
import {
  ChainProvider,
  ReactiveDotProvider,
  SignerProvider,
  useMutationEffect,
  useQueryRefresher,
} from "@reactive-dot/react";
import { ConnectionButton } from "dot-connect/react.js";
import { Suspense, useState } from "react";
import { toast, Toaster } from "sonner";
import { AccountSelector } from "./account-selector";
import { config } from "./config";
import {
  SelectedAccountStateContext,
  useSelectedAccountState,
} from "./hooks/use-selected-account";
import { KittyList } from "./kitty-list";
import { MarketplaceList } from "./marketplace-list";
import { MintKitty } from "./mint-kitty";

function Page() {
  useMutationEffect((event) => {
    if (event.value === pending) {
      toast.loading("Submitting transaction", { id: event.id });
    } else if (event.value instanceof Error) {
      toast.error("Failed to submit transaction", { id: event.id });
    } else {
      switch (event.value.type) {
        case "finalized":
          toast.success("Transaction finalized", { id: event.id });
          break;
        default:
          toast.loading("Transaction in progress", { id: event.id });
      }
    }
  });

  const refreshKitties = useQueryRefresher((builder) =>
    builder.readStorageEntries("Kitties", "Kitties", [])
  );

  useMutationEffect((event) => {
    if (
      event.value !== pending &&
      !(event.value instanceof Error) &&
      event.value.type === "txBestBlocksState"
    ) {
      refreshKitties();
    }
  });

  return (
    <SignerProvider signer={useSelectedAccountState()[0]?.polkadotSigner}>
      <main className="p-4">
        <h1 className="pb-8 text-2xl font-bold">Substrate Kitties</h1>
        <Grid gap="4" columns="1">
          <ConnectionButton />
          <AccountSelector />
          <MintKitty />
          <KittyList />
          <MarketplaceList />
        </Grid>
      </main>
    </SignerProvider>
  );
}

export default function App() {
  return (
    <ReactiveDotProvider config={config}>
      <ChainProvider chainId="kitties">
        <Suspense>
          <SelectedAccountStateContext.Provider value={useState()}>
            <Theme>
              <Page />
              <Toaster />
            </Theme>
          </SelectedAccountStateContext.Provider>
        </Suspense>
      </ChainProvider>
    </ReactiveDotProvider>
  );
}
