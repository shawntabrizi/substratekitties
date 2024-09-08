import { MarketplaceKittyCard } from "./marketplace-kitty-card";
import { Heading, Grid } from "@radix-ui/themes";
import { useKittyContext } from "./context/kitty-context";

export function MarketplaceList() {
  const { kitties, selectedAccount } = useKittyContext();

  return (
    <div>
      <Heading size="5" mb="4">
        Marketplace
      </Heading>
      <Grid columns="3" gap="4">
        {kitties
          .filter(
            (kitty) =>
              kitty.owner !== selectedAccount && kitty.price !== undefined
          )
          .map((kitty) => (
            <MarketplaceKittyCard
              key={kitty.dna.toString()}
              dna={kitty.dna.toString()}
              price={kitty.price!}
              owner={kitty.owner}
            />
          ))}
      </Grid>
    </div>
  );
}
