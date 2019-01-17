use system::ensure_signed;
use srml_support::{StorageValue, StorageMap, dispatch::Result};
use runtime_primitives::traits::{Hash, As};
use rstd::prelude::*;

pub trait Trait: balances::Trait {}

#[derive(Encode, Decode, Default, Clone, PartialEq, Debug)]
pub struct Kitty<Hash, Balance> {
  name: Vec<u8>,
  dna: Hash,
  price: Balance,
  gen: u32,
}

decl_storage! {
    trait Store for Module<T: Trait> as CryptokittiesStorage {
        // Look up a kitty by its owner and relative index
        OwnedTokens get(token_of_owner_by_index): map (T::AccountId, u64) => u64;

        // Total number of kitties
        TotalSupply get(total_supply): u64;
        
        // Get the owner of a kitty by its global index
        TokenOwner get(owner_of): map u64 => Option<T::AccountId>;

        // Look up a kitty by its global index
        AllTokens get(token_by_index): map u64 => Kitty<T::Hash, T::Balance>;

        // Get the number of kitties owned by a user
        OwnedTokensCount get(balance_of): map T::AccountId => u64;

        // Convert a kitties global index to its owners relative index
        OwnedTokenIndex: map u64 => u64;
    }
}

decl_module! {
    pub struct Module<T: Trait> for enum Call where origin: T::Origin {
        fn create_kitty(origin, name: Vec<u8>) -> Result {
            let sender = ensure_signed(origin)?;

            let total_supply = Self::total_supply();
            let balance_of = Self::balance_of(&sender);

            let new_total_supply = match total_supply.checked_add(1) {
                Some(x) => x,
                None => return Err("Overflow when adding to total supply"),
            };

            let new_balance_of = match balance_of.checked_add(1) {
                Some(x) => x,
                None => return Err("Overflow when adding to user balance"),
            };

            let new_kitty = Kitty {
                                name: name,
                                dna: <T as system::Trait>::Hashing::hash_of(&0),
                                price: <T::Balance as As<u64>>::sa(0),
                                gen: 0,
                            };

            <OwnedTokens<T>>::insert((sender.clone(), balance_of), &new_kitty);
            <TotalSupply<T>>::put(new_total_supply);
            <TokenOwner<T>>::insert(total_supply, &sender);
            <AllTokens<T>>::insert(total_supply, &new_kitty);
            <OwnedTokensCount<T>>::insert(&sender, new_balance_of);
            <OwnedTokenIndex<T>>::insert(total_supply, balance_of);

            Ok(())
        }

        fn transfer_kitty(origin, index: u64, to: T::AccountId) -> Result {
            let sender = ensure_signed(origin)?;

            let owner = Self::owner_of(index);
            ensure!(sender == owner, "You cannot transfer a kitty you do not own");

            let from = sender;

            let from_balance_of = Self::balance_of(&from);
            let to_balance_of = Self::balance_of(&to);

            let new_from_balance_of = match from_balance_of.checked_sub(1) {
                Some(x) => x,
                None => Err("Underflow when updating 'from' balance");
            };

            let to_balance_of = match to_balance_of.checked_add(1) {
                Some(x) => x,
                None => Err("Overflow when updating 'to' balance");
            }

            // Swap desired kitty with last element and remove last element
            let token_index = <OwnedTokenIndex<T>>::get()
        }
    }
}