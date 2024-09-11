import type { PolkadotSigner } from "polkadot-api";
import { createContext, useContext } from "react";
import type { Kitty } from "../types";

interface KittyContextType {
  kitties: Kitty[];
  kittiesOwned: Record<string, string[]>; // owner => kitty DNA
  selectedAccount?: string;
  polkadotSigner?: PolkadotSigner;
  setSelectedAccount: (account: string) => void;
  connect: () => Promise<void>;
  connectWithDevPhrase: (path?: string) => void;
  disconnect: () => Promise<void>;
}

export const KittyContext = createContext<KittyContextType>({
  kitties: [],
  kittiesOwned: {},
  setSelectedAccount: () => {},
  connect: () => Promise.resolve(),
  connectWithDevPhrase: () => {},
  disconnect: () => Promise.resolve(),
});

export const useKittyContext = () => {
  const context = useContext(KittyContext);
  if (!context) {
    throw new Error("useKittyContext must be used within a KittyProvider");
  }
  return context;
};
