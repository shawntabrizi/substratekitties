import { MarketplaceKittyCard } from "./marketplace-kitty-card";
import { Heading, Grid } from "@radix-ui/themes";
import { useKittyContext } from "./context/kitty-context";

export function MarketplaceList() {
  const { kitties, selectedAccount } = useKittyContext();
  const marketplaceKitties = kitties.filter(
    (kitty) => kitty.owner !== selectedAccount && kitty.price !== null
  );

  return (
    <div>
      <Heading size="5" mb="4">
        Marketplace
      </Heading>
      <Grid columns="3" gap="4">
        {marketplaceKitties.map((kitty) => (
          <MarketplaceKittyCard key={kitty.dna} kitty={kitty} />
        ))}
      </Grid>
    </div>
  );
}
