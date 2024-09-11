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
import { useState } from "react";
import { getKitties, getKittiesOwned } from "../api/methods";
import { KittyContext } from "./use-kitty-context";

interface Props {
  children: React.ReactNode;
}

export const KittyProvider = ({ children }: Props) => {
  const [selectedAccount, setSelectedAccount] = useState<string>();
  const [polkadotSigner, setPolkadotSigner] = useState<PolkadotSigner>();

  const { data: kitties } = useQuery({
    queryKey: ["kitties"],
    queryFn: getKitties,
    staleTime: 0,
  });
  const { data: kittiesOwned } = useQuery({
    queryKey: ["kitties", "owned"],
    queryFn: getKittiesOwned,
    staleTime: 0,
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
