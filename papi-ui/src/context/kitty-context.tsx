import { createContext, useContext, useState } from "react";
import { data } from "./data";

export interface Kitty {
  dna: string;
  owner: string;
  price: number | null;
}

interface KittyContextType {
  kitties: Kitty[];
  kittiesOwned: Record<string, string[]>; // owner to kitty DNA
  countForKitties: number;
  selectedAccount?: string;
  setSelectedAccount: (account?: string) => void;
}

const KittyContext = createContext<KittyContextType>({
  kitties: [],
  kittiesOwned: {},
  countForKitties: 0,
  selectedAccount: undefined,
  setSelectedAccount: () => {},
});

export const KittyProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedAccount, setSelectedAccount] = useState<string>();
  const [kitties, setKitties] = useState<Kitty[]>(data.kitties);
  const [kittiesOwned, setKittiesOwned] = useState<Record<string, string[]>>(
    data.kittiesOwned
  );
  const [countForKitties, setCountForKitties] = useState(data.countForKitties);

  return (
    <KittyContext.Provider
      value={{
        kitties,
        kittiesOwned,
        countForKitties,
        selectedAccount,
        setSelectedAccount,
      }}
    >
      {children}
    </KittyContext.Provider>
  );
};

export const useKittyContext = () => {
  const context = useContext(KittyContext);
  if (!context) {
    throw new Error("useKittyContext must be used within a KittyProvider");
  }
  return context;
};
