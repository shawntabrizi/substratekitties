import { Grid, Heading } from "@radix-ui/themes";
import { useKittyContext } from "./context/kitty-context";
import { KittyCard } from "./kitty-card";

export function KittyList() {
  const { kittiesOwned, kitties, selectedAccount } = useKittyContext();

  if (!selectedAccount) {
    return (
      <div>
        <Heading size="5" mb="4">
          No account selected
        </Heading>
      </div>
    );
  }

  const ownedKitties = kittiesOwned[selectedAccount] ?? [];

  return (
    <div>
      <Heading size="5" mb="4">
        Your Kitties
      </Heading>
      <Grid columns="3" gap="4">
        {ownedKitties.map((dna) => {
          const kitty = kitties.find((k) => k.dna === dna);
          if (!kitty) return null;
          return <KittyCard key={kitty.dna} kitty={kitty} isOwner={true} />;
        })}
      </Grid>
    </div>
  );
}
