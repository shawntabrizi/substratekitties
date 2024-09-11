import { blake2b256, ss58Encode } from "@polkadot-labs/hdkd-helpers";
import { FixedSizeBinary, type PolkadotSigner } from "polkadot-api";
import { data } from "../context/data";
import { toHex } from "../utils";
import { SHOULD_USE_LOCAL_DATA } from "./constants";
import { polkadotApi } from "./papi-client";

let kitties = data.kitties.map((kitty) => ({
  ...kitty,
  price: kitty.price?.toString(),
}));
let kittiesOwned = data.kittiesOwned;

export async function buyKitty({
  polkadotSigner,
  dna,
  maxPrice,
}: {
  polkadotSigner?: PolkadotSigner;
  dna: string;
  maxPrice: bigint;
}) {
  if (!polkadotSigner) {
    throw new Error("No signer found");
  }
  if (SHOULD_USE_LOCAL_DATA) {
    const kitty = kitties.find((kitty) => kitty.dna === dna);
    if (!kitty) {
      return { ok: false, error: "Kitty not found" };
    }
    const newOwner = ss58Encode(polkadotSigner.publicKey, 0);
    kittiesOwned = {
      ...kittiesOwned,
      [kitty.owner]: kittiesOwned[kitty.owner].filter((kitty) => kitty !== dna),
      [newOwner]: [...kittiesOwned[newOwner], dna],
    };
    kitties = kitties.map((kitty) =>
      kitty.dna === dna ? { ...kitty, owner: newOwner } : kitty
    );
    return { ok: true };
  }
  if (!polkadotApi) {
    throw new Error("No polkadot API found");
  }
  const kittyId = FixedSizeBinary.fromHex(dna);
  return await polkadotApi.tx.Kitties.buy_kitty({
    kitty_id: kittyId,
    max_price: maxPrice,
  }).signAndSubmit(polkadotSigner);
}

export async function mintKitty({
  polkadotSigner,
}: {
  polkadotSigner?: PolkadotSigner;
}) {
  if (!polkadotSigner) {
    throw new Error("No signer found");
  }
  if (SHOULD_USE_LOCAL_DATA) {
    const owner = ss58Encode(polkadotSigner.publicKey, 0);
    const dna = `0x${toHex(
      blake2b256(crypto.getRandomValues(new Uint8Array(32)))
    )}`;
    const newKitty = {
      dna,
      owner,
      price: undefined,
    };
    kitties = [...kitties, newKitty];
    kittiesOwned[owner] = [...kittiesOwned[owner], newKitty.dna];
    return { ok: true };
  }
  if (!polkadotApi) {
    throw new Error("No polkadot API found");
  }
  return await polkadotApi.tx.Kitties.create_kitty().signAndSubmit(
    polkadotSigner
  );
}

export async function setPrice({
  polkadotSigner,
  dna,
  price,
}: {
  polkadotSigner?: PolkadotSigner;
  dna: string;
  price?: bigint;
}) {
  if (!polkadotSigner) {
    throw new Error("No signer found");
  }
  if (SHOULD_USE_LOCAL_DATA) {
    const kitty = kitties.find((kitty) => kitty.dna === dna);
    if (!kitty) {
      return { ok: false, error: "Kitty not found" };
    }
    kitties = kitties.map((kitty) =>
      kitty.dna === dna ? { ...kitty, price: price?.toString() } : kitty
    );
    return { ok: true };
  }
  if (!polkadotApi) {
    throw new Error("No polkadot API found");
  }
  const kittyId = FixedSizeBinary.fromHex(dna);
  return await polkadotApi.tx.Kitties.set_price({
    kitty_id: kittyId,
    new_price: price,
  }).signAndSubmit(polkadotSigner);
}

export async function transferKitty({
  polkadotSigner,
  kittyId,
  newOwner,
}: {
  polkadotSigner?: PolkadotSigner;
  kittyId: string;
  newOwner: string;
}) {
  if (!polkadotSigner) {
    throw new Error("No signer found");
  }
  if (SHOULD_USE_LOCAL_DATA) {
    const kitty = kitties.find((kitty) => kitty.dna === kittyId);
    if (!kitty) {
      return { ok: false, error: "Kitty not found" };
    }
    kitties = kitties.map((kitty) =>
      kitty.dna === kittyId ? { ...kitty, owner: newOwner } : kitty
    );
    kittiesOwned = {
      ...kittiesOwned,
      [kitty.owner]: kittiesOwned[kitty.owner].filter(
        (kitty) => kitty !== kittyId
      ),
      [newOwner]: [...kittiesOwned[newOwner], kittyId],
    };
    return { ok: true };
  }
  if (!polkadotApi) {
    throw new Error("No polkadot API found");
  }
  return await polkadotApi.tx.Kitties.transfer({
    kitty_id: FixedSizeBinary.fromHex(kittyId),
    to: newOwner,
  }).signAndSubmit(polkadotSigner);
}

export async function getKitties() {
  if (SHOULD_USE_LOCAL_DATA) {
    return [...kitties];
  }
  if (!polkadotApi) {
    throw new Error("No polkadot API found");
  }
  const response = await polkadotApi.query.Kitties.Kitties.getEntries();
  return response.map((kitty) => ({
    dna: kitty.value.dna.asHex(),
    owner: kitty.value.owner.toString(),
    price: kitty.value.price?.toString(),
  }));
}

export async function getKittiesOwned() {
  if (SHOULD_USE_LOCAL_DATA) {
    return { ...kittiesOwned };
  }
  if (!polkadotApi) {
    throw new Error("No polkadot API found");
  }
  const response = await polkadotApi.query.Kitties.KittiesOwned.getEntries();
  return response.reduce((acc, kitty) => {
    acc[kitty.keyArgs.toString()] = kitty.value.map((dna) => dna.asHex());
    return acc;
  }, {} as Record<string, string[]>);
}
