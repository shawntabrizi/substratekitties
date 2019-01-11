use parity_codec::Encode;
use srml_support::{StorageValue, StorageMap, dispatch::Result};
use system::ensure_signed;
use runtime_primitives::traits::{Hash, Zero, As};
use rstd::prelude::*;

pub trait Trait: balances::Trait {}

#[derive(Encode, Decode, Default, Clone, PartialEq, Debug)]
pub struct Kitty<Hash, Balance> {
    name: Vec<u8>,
    dna: Hash,
    price: Balance,
}

decl_module! {
  pub struct Module<T: Trait> for enum Call where origin: T::Origin {
    fn create_random_cat(origin, name: Vec<u8>) -> Result {
        let sender = ensure_signed(origin)?;
        let random_seed = <system::Module<T>>::random_seed();
        let dna = (random_seed, &sender).using_encoded(<T as system::Trait>::Hashing::hash);

        let new_kitty = Kitty { name, dna, price: <T::Balance as As<u64>>::sa(0) };
        let current_kitty_count = Self::kitty_count();
        let mut current_owned_kitties = Self::owned_kitties(&sender);

        current_owned_kitties.push(current_kitty_count);

        let new_kitty_count = match current_kitty_count.checked_add(1) {
          Some(c) => c,
          None => return Err("got overflow after adding a new kitty"),
        };

        <Kitties<T>>::insert(current_kitty_count, new_kitty);
        <OwnerToKitties<T>>::insert(sender.clone(), current_owned_kitties);
        <KittyToOwner<T>>::insert(current_kitty_count, sender.clone());
        <KittiesCount<T>>::put(new_kitty_count);

        Ok(())
    }

    fn set_price(origin, index: u32, new_price: T::Balance) -> Result {
        let sender = ensure_signed(origin)?;

        ensure!(index < Self::kitty_count(), "This cat does not exist");

        let kitty_owner = Self::kitty_to_owner(index);
        ensure!(kitty_owner == sender, "You do not own this cat");

        let mut kitty = Self::kitty(index);
        kitty.price = new_price;

        <Kitties<T>>::insert(index, kitty);

        Ok(())
    }

    fn buy_cat(origin, index: u32, max_price: T::Balance) -> Result {
        let sender = ensure_signed(origin)?;

        ensure!(index < Self::kitty_count(), "This cat does not exist");
        
        let kitty_owner = Self::kitty_to_owner(index);
        ensure!(sender != kitty_owner, "You can't buy your own cat");

        let mut kitty = Self::kitty(index);
        ensure!(!kitty.price.is_zero(), "The cat you want to buy is not for sale");
        ensure!(kitty.price < max_price, "The cat you want to buy costs more than your max price");

        <balances::Module<T>>::decrease_free_balance(&sender, kitty.price)?;
        <balances::Module<T>>::increase_free_balance_creating(&kitty_owner, kitty.price);
        kitty.price = <T::Balance as As<u64>>::sa(0);

        <Kitties<T>>::insert(index, kitty);
        <KittyToOwner<T>>::insert(index, &sender);

        let mut kitty_owner_owned_kitties = Self::owned_kitties(&kitty_owner);
        let mut sender_owned_kitties = Self::owned_kitties(&sender);

        let rm_index = kitty_owner_owned_kitties.iter().position(|x| *x == index).unwrap();
        kitty_owner_owned_kitties.remove(rm_index);
        sender_owned_kitties.push(index);
        
        <OwnerToKitties<T>>::insert(&sender, sender_owned_kitties);
        <OwnerToKitties<T>>::insert(&kitty_owner, kitty_owner_owned_kitties);

        Ok(())

    }
  }
}

decl_storage! {
  trait Store for Module<T: Trait> as CryptokittiesStorage {
    KittiesCount get(kitty_count): u32 = 0;
    Kitties get(kitty): map u32 => Kitty<T::Hash, T::Balance>;
    OwnerToKitties get(owned_kitties): map T::AccountId => Vec<u32>;
    KittyToOwner get(kitty_to_owner): map u32 => T::AccountId;
  }
}