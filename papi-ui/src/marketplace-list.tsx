import { Grid, Heading } from "@radix-ui/themes";
import { MarketplaceKittyCard } from "./marketplace-kitty-card";
import type { KittyForSale } from "./types";

interface Props {
  kittiesForSale: KittyForSale[];
}

export function MarketplaceList({ kittiesForSale }: Props) {
  return (
    <div>
      <Heading size="5" mb="4">
        Marketplace
      </Heading>
      <Grid columns="3" gap="4">
        {kittiesForSale
          .filter((kitty) => kitty.price !== undefined)
          .map((kitty) => (
            <MarketplaceKittyCard
              key={kitty.dna.toString()}
              dna={kitty.dna.toString()}
              price={kitty.price}
              owner={kitty.owner}
            />
          ))}
      </Grid>
    </div>
  );
}
