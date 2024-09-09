import type { Kitty } from "../types";

let kitties = [
  {
    dna: "0x8670149c535360ee9e1c6097b53d6f2d79c401143d5f2daf618b5ec1d943828a",
    owner: "126TwBzBM4jUEK2gTphmW4oLoBWWnYvPp8hygmduTr4uds57",
  },
  {
    dna: "0xc589a20a598ec1c0cd38d4f4222292b3e6ce461bee68e5439b76eee91d0ddb9d",
    owner: "126TwBzBM4jUEK2gTphmW4oLoBWWnYvPp8hygmduTr4uds57",
  },
  {
    dna: "0xd925ad500b4d02d656e66a4fda1cc32f71c5285f784559e82a8ace33e6802cf6",
    owner: "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5",
    price: 123456,
  },
  {
    dna: "0x3347ff95f67432f4fb236daf78dfec0a18e12b4e22f3db2b69c34f8d9e892a31",
    owner: "16D2eVuK5SWfwvtFD3gVdBC2nc2BafK31BY6PrbZHBAGew7L",
  },
  {
    dna: "0x9a0a9d89424a54c0b153f18d5904e6eca08304afd99f37264955fe19adfbcc5b",
    owner: "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3",
  },
  {
    dna: "0xe9be41ac4f36bb381f1a941fba6bad7877e55c00c0cd6fabe748fb6e2ce47f4a",
    owner: "126TwBzBM4jUEK2gTphmW4oLoBWWnYvPp8hygmduTr4uds57",
  },
  {
    dna: "0x7f6629f239c4a30495c3eb68442b267f4823769e79e437ca54c6da6c4c2e005e",
    owner: "16D2eVuK5SWfwvtFD3gVdBC2nc2BafK31BY6PrbZHBAGew7L",
    price: 456789,
  },
  {
    dna: "0x8eb69b4b3852aeb9e3daeb7f2878be7ae7f4075661ac9d7b4ca97e47a80832e2",
    owner: "14Gjs1TD93gnwEBfDMHoCgsuf1s2TVKUP6Z1qKmAZnZ8cW5q",
  },
  {
    dna: "0xc3449b3791799bd1034cdaa30a9e88c50eb17d3388dc689016cf591a1201bca1",
    owner: "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3",
  },
  {
    dna: "0x6084c75c7ef68b8c8c65d73e4c5a75a3aa074c6e87b8700acc152b18f4f86693",
    owner: "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5",
  },
] as Kitty[];

let kittiesOwned = {
  "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3": [
    "0x9a0a9d89424a54c0b153f18d5904e6eca08304afd99f37264955fe19adfbcc5b",
    "0xc3449b3791799bd1034cdaa30a9e88c50eb17d3388dc689016cf591a1201bca1",
  ],
  "14Gjs1TD93gnwEBfDMHoCgsuf1s2TVKUP6Z1qKmAZnZ8cW5q": [
    "0x8eb69b4b3852aeb9e3daeb7f2878be7ae7f4075661ac9d7b4ca97e47a80832e2",
  ],
  "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5": [
    "0x6084c75c7ef68b8c8c65d73e4c5a75a3aa074c6e87b8700acc152b18f4f86693",
    "0xd925ad500b4d02d656e66a4fda1cc32f71c5285f784559e82a8ace33e6802cf6",
  ],
  "126TwBzBM4jUEK2gTphmW4oLoBWWnYvPp8hygmduTr4uds57": [
    "0xe9be41ac4f36bb381f1a941fba6bad7877e55c00c0cd6fabe748fb6e2ce47f4a",
    "0xc589a20a598ec1c0cd38d4f4222292b3e6ce461bee68e5439b76eee91d0ddb9d",
    "0x8670149c535360ee9e1c6097b53d6f2d79c401143d5f2daf618b5ec1d943828a",
  ],
  "16D2eVuK5SWfwvtFD3gVdBC2nc2BafK31BY6PrbZHBAGew7L": [
    "0x3347ff95f67432f4fb236daf78dfec0a18e12b4e22f3db2b69c34f8d9e892a31",
    "0x7f6629f239c4a30495c3eb68442b267f4823769e79e437ca54c6da6c4c2e005e",
  ],
} as Record<string, string[]>;

export const data = { kitties, kittiesOwned };
