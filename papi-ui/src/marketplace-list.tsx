import { MarketplaceKittyCard } from "./marketplace-kitty-card";
import { Heading, Grid } from "@radix-ui/themes";
import { useKittyContext } from "./context/kitty-context";

interface Props {
  account: string;
}

export function MarketplaceList({ account }: Props) {
  const { kitties } = useKittyContext();
  const marketplaceKitties = kitties.filter(
    (kitty) => kitty.owner !== account && kitty.price !== null
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
