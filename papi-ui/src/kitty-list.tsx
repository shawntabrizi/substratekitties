import { Grid, Heading, Text } from "@radix-ui/themes";
import { useKittyContext } from "./context/kitty-context";
import { KittyCard } from "./kitty-card";
import {
  ss58Address,
  ss58Decode,
  ss58Encode,
  ss58PublicKey,
} from "@polkadot-labs/hdkd-helpers";

export function KittyList() {
  const { kittiesOwned, kitties, selectedAccount, polkadotSigner } =
    useKittyContext();

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

  const kittiesOwnedByAccount = kittiesOwned[selectedAccount];
  const isOwner =
    polkadotSigner !== undefined
      ? polkadotSigner.publicKey.toString() ===
        ss58Decode(selectedAccount)[0].toString()
      : false;

  return (
    <div>
      <Heading size="5" mb="4">
        Kitties owned by {isOwner ? "you" : selectedAccount}
      </Heading>
      <Grid columns="3" gap="4">
        {kittiesOwnedByAccount.map((dna) => {
          const kitty = kitties.find((k) => k.dna === dna);
          if (!kitty) return null;
          return <KittyCard key={kitty.dna} kitty={kitty} isOwner={isOwner} />;
        })}
      </Grid>
    </div>
  );
}
