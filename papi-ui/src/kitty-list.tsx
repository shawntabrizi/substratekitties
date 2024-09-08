import { data } from "./context/data";
import { KittyCard } from "./kitty-card";
import { useKittyContext } from "./context/kitty-context";

interface Props {
  account: string;
}

export function KittyList({ account }: Props) {
  const { kittiesOwned } = useKittyContext();

  const ownedKitties = kittiesOwned[account] ?? [];

  return (
    <div>
      <h2>Your Kitties</h2>
      {ownedKitties.map((dna) => {
        const kitty = data.kitties.find((k) => k.dna === dna);
        if (!kitty) return null;
        return <KittyCard key={kitty.dna} kitty={kitty} isOwner={true} />;
      })}
    </div>
  );
}
