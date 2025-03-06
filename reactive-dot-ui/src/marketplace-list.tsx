import { Grid, Heading } from "@radix-ui/themes";
import { useLazyLoadQuery } from "@reactive-dot/react";
import { Suspense } from "react";
import { MarketplaceKittyCard } from "./marketplace-kitty-card";

export function MarketplaceList() {
  return (
    <div>
      <Heading size="5" mb="4">
        Marketplace
      </Heading>
      <Suspense fallback="Loading kitties for sale...">
        <SuspendableMarketplaceList />
      </Suspense>
    </div>
  );
}

function SuspendableMarketplaceList() {
  const kitties = useLazyLoadQuery((builder) =>
    builder.readStorageEntries("Kitties", "Kitties", [])
  );

  return (
    <Grid columns="3" gap="4">
      {kitties
        .map(({ value: kitty }) => kitty)
        .filter((kitty) => kitty.price !== undefined)
        .map((kitty) => (
          <MarketplaceKittyCard
            key={kitty.dna.asHex()}
            dna={kitty.dna.asHex()}
            price={kitty.price!}
            owner={kitty.owner}
          />
        ))}
    </Grid>
  );
}
