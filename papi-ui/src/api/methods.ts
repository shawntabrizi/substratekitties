import { FixedSizeBinary, type PolkadotSigner } from "polkadot-api";
import { polkadotApi } from "./papi-client";

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
  return await polkadotApi.tx.Kitties.transfer({
    kitty_id: FixedSizeBinary.fromHex(kittyId),
    to: newOwner,
  }).signAndSubmit(polkadotSigner);
}

export async function getKitties() {
  return await polkadotApi.query.Kitties.Kitties.getEntries();
}

export async function getKittiesOwned() {
  return await polkadotApi.query.Kitties.KittiesOwned.getEntries();
}
