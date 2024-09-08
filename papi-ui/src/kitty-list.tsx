import { Grid, Heading, Text } from "@radix-ui/themes";
import { type Kitty } from "./context/kitty-context";
import { KittyCard } from "./kitty-card";

interface Props {
  kitties: Kitty[];
  selectedAccount?: string;
  isUserSelectedAccount: boolean;
}

export function KittyList({
  kitties,
  selectedAccount,
  isUserSelectedAccount,
}: Props) {
  if (!selectedAccount) {
    return (
      <div>
        <Heading size="5" mb="4">
          {selectedAccount} Kitties
        </Heading>
        <Text>No account selected</Text>
      </div>
    );
  }

  return (
    <div>
      <Heading size="5" mb="4">
        Kitties owned by {isUserSelectedAccount ? "you" : selectedAccount}
      </Heading>
      <Grid columns="3" gap="4">
        {kitties.map((kitty) => (
          <KittyCard
            key={kitty.dna}
            kitty={kitty}
            isOwner={isUserSelectedAccount}
          />
        ))}
      </Grid>
    </div>
  );
}
