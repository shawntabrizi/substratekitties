export type Kitty = {
  dna: string;
  owner: string;
  price?: string;
};

export type KittyForSale = Kitty & {
  price: string;
};
