import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers";
import { useQuery } from "@tanstack/react-query";
import { type PolkadotSigner } from "polkadot-api";
import {
  connectInjectedExtension,
  getInjectedExtensions,
  type InjectedExtension,
  type InjectedPolkadotAccount,
} from "polkadot-api/pjs-signer";
import { getPolkadotSigner } from "polkadot-api/signer";
import { createContext, useContext, useState } from "react";
import { getKitties, getKittiesOwned } from "../api/methods";
import { data } from "./data";

export type Kitty = {
  dna: string;
  owner: string;
  price?: bigint;
};

export type KittyForSale = Kitty & {
  price: bigint;
};

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

const KittyContext = createContext<KittyContextType>({
  kitties: [],
  kittiesOwned: {},
  setSelectedAccount: () => {},
  connect: () => Promise.resolve(),
  connectWithDevPhrase: () => {},
  disconnect: () => Promise.resolve(),
});

const shouldUseLocalData = import.meta.env.VITE_USE_LOCAL_DATA === "true";

export const KittyProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedAccount, setSelectedAccount] = useState<string>();
  const [polkadotSigner, setPolkadotSigner] = useState<PolkadotSigner>();

  const { data: kitties } = useQuery({
    queryKey: ["kitties"],
    queryFn: async () => {
      const kitties = await getKitties();
      return kitties.map((kitty) => ({
        dna: kitty.value.dna.asHex(),
        owner: kitty.value.owner.toString(),
        price: kitty.value.price,
      }));
    },
    enabled: !shouldUseLocalData,
    initialData: data.kitties,
  });
  const { data: kittiesOwned } = useQuery({
    queryKey: ["kitties", "owned"],
    queryFn: async () => {
      const data = await getKittiesOwned();
      return data.reduce((acc, kitty) => {
        acc[kitty.keyArgs.toString()] = kitty.value.map((dna) => dna.asHex());
        return acc;
      }, {} as Record<string, string[]>);
    },
    enabled: !shouldUseLocalData,
    initialData: data.kittiesOwned,
  });

  async function connect() {
    const extensions: string[] = getInjectedExtensions();

    const selectedExtension: InjectedExtension = await connectInjectedExtension(
      extensions[0]
    );

    const accounts: InjectedPolkadotAccount[] = selectedExtension.getAccounts();

    const polkadotSigner = accounts[0].polkadotSigner;
    setPolkadotSigner(polkadotSigner);
  }

  function connectWithDevPhrase(path: string = "//Alice") {
    const entropy = mnemonicToEntropy(DEV_PHRASE);
    const miniSecret = entropyToMiniSecret(entropy);
    const derive = sr25519CreateDerive(miniSecret);
    const hdkdKeyPair = derive(path);

    const polkadotSigner = getPolkadotSigner(
      hdkdKeyPair.publicKey,
      "Sr25519",
      hdkdKeyPair.sign
    );
    setPolkadotSigner(polkadotSigner);
  }
  async function disconnect() {
    setPolkadotSigner(undefined);
  }

  return (
    <KittyContext.Provider
      value={{
        kitties: kitties ?? [],
        kittiesOwned: kittiesOwned ?? {},
        selectedAccount,
        setSelectedAccount,
        polkadotSigner,
        connect,
        connectWithDevPhrase,
        disconnect,
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
