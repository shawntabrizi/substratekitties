use system::ensure_signed;
use srml_support::{StorageValue, StorageMap, dispatch::Result};
use runtime_primitives::traits::{Hash, As};
use rstd::prelude::*;
use parity_codec::Encode;

pub trait Trait: balances::Trait {}

#[derive(Encode, Decode, Default, Clone, PartialEq, Debug)]
pub struct Kitty<Hash, Balance> {
    id: Hash,
    name: Vec<u8>,
    dna: Hash,
    price: Balance,
    gen: u64,
}

decl_storage! {
    trait Store for Module<T: Trait> as CryptokittiesStorage {
        Kitties get(kitty): map T::Hash => Kitty<T::Hash, T::Balance>;
        KittyOwner get(owner_of): map T::Hash => Option<T::AccountId>;

        AllKitties get(kitty_by_index): map u64 => T::Hash;
        AllKittiesCount get(all_kitties_count): u64;
        AllKittiesIndex: map T::Hash => u64;

        OwnedKitties get(kitty_of_owner_by_index): map (T::AccountId, u64) => T::Hash;
        OwnedKittiesCount get(owned_kitty_count): map T::AccountId => u64;
        OwnedKittiesIndex: map T::Hash => u64;
        
        Nonce: u64;
    }
}

decl_module! {
    pub struct Module<T: Trait> for enum Call where origin: T::Origin {
        fn create_kitty(origin, name: Vec<u8>) -> Result {
            let sender = ensure_signed(origin)?;
            let nonce = <Nonce<T>>::get();

            let random_hash = (<system::Module<T>>::random_seed(), &sender, nonce).using_encoded(<T as system::Trait>::Hashing::hash);

            ensure!(!<Kitties<T>>::exists(random_hash), "This kitty id already exists");

            let all_kitties_count = Self::all_kitties_count();

            let new_all_kities_count = match all_kitties_count.checked_add(1) {
                Some(x) => x,
                None => return Err("Overflow when adding to total kitty count"),
            };

            let owned_kitty_count = Self::owned_kitty_count(&sender);

            let new_owned_kitty_count = match owned_kitty_count.checked_add(1) {
                Some(x) => x,
                None => return Err("Overflow when adding to owned kitty count"),
            };

            let new_kitty = Kitty {
                                id: random_hash,
                                name: name,
                                dna: random_hash,
                                price: <T::Balance as As<u64>>::sa(0),
                                gen: 0,
                            };

            <OwnedKitties<T>>::insert((sender.clone(), owned_kitty_count), random_hash);
            <OwnedKittiesIndex<T>>::insert(random_hash, owned_kitty_count);
            <OwnedKittiesCount<T>>::insert(&sender, new_owned_kitty_count);
            <Kitties<T>>::insert(random_hash, new_kitty);
            <KittyOwner<T>>::insert(random_hash, &sender);
            <AllKitties<T>>::insert(all_kitties_count, random_hash);
            <AllKittiesIndex<T>>::insert(random_hash, all_kitties_count);
            <AllKittiesCount<T>>::put(new_all_kities_count);
            <Nonce<T>>::mutate(|n| *n += 1);

            Ok(())
        }
    }
}