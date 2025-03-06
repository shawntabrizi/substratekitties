import { Grid, Heading, Text } from "@radix-ui/themes";
import { useAccounts, useLazyLoadQuery } from "@reactive-dot/react";
import { Suspense } from "react";
import { useSelectedAccountState } from "./hooks/use-selected-account";
import { KittyCard } from "./kitty-card";

export function KittyList() {
  const accounts = useAccounts();
  const [selectedAccount] = useSelectedAccountState();

  const isUserSelectedAccount = accounts.some(
    (account) => account.address === selectedAccount?.address
  );

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
        Kitties owned by{" "}
        {isUserSelectedAccount ? "you" : selectedAccount.address}
      </Heading>
      <Suspense fallback="Loading your kitties...">
        <SuspendableKittiesList />
      </Suspense>
    </div>
  );

  function SuspendableKittiesList() {
    const kittyDnas = useLazyLoadQuery((builder) =>
      builder.readStorage("Kitties", "KittiesOwned", [selectedAccount!.address])
    );

    const kitties = useLazyLoadQuery((builder) =>
      builder.readStorages(
        "Kitties",
        "Kitties",
        kittyDnas.map((dna) => [dna] as const)
      )
    );

    return (
      <Grid columns="3" gap="4">
        {kitties
          .filter((kitty) => kitty !== undefined)
          .map((kitty) => (
            <KittyCard
              key={kitty.dna.asHex()}
              dna={kitty.dna.asHex()}
              owner={kitty.owner}
              price={kitty.price}
              isOwner={isUserSelectedAccount}
            />
          ))}
      </Grid>
    );
  }
}
