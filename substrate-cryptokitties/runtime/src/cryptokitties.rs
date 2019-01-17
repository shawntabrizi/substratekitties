use parity_codec::Encode;
use srml_support::{StorageValue, StorageMap, dispatch::Result};
use system::ensure_signed;
use runtime_primitives::traits::Hash;
use rstd::prelude::*;
use rstd::cmp;

#[derive(Encode, Decode, Default, Clone, PartialEq, Debug)]
pub struct Kitty<Hash, Balance> {
    id: Hash,
    name: Vec<u8>,
    dna: Hash,
    price: Option<Balance>,
    gen: u64,
}

pub trait Trait: balances::Trait {
    type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;
}

decl_event!(
    pub enum Event<T>
    where
        <T as system::Trait>::AccountId,
        <T as system::Trait>::Hash
    {
        Created(AccountId, Hash),
        Transferred(AccountId, AccountId, Hash),
    }
);

decl_storage! {
    trait Store for Module<T: Trait> as KittyStorage {
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

        fn deposit_event<T>() = default;

        fn transfer(origin, to: T::AccountId, kitty_id: T::Hash) -> Result {
            let sender = ensure_signed(origin)?;

            let owner = match Self::owner_of(kitty_id) {
                Some(o) => o,
                None => return Err("No owner for this kitty"),
            };
            ensure!(owner == sender, "You do not own this kitty");

            Self::_transfer_from(sender, to, kitty_id)?;

            Ok(())
        }

        fn create_kitty(origin, name: Vec<u8>) -> Result {
            let sender = ensure_signed(origin)?;
            let nonce = <Nonce<T>>::get();
            let random_hash = (<system::Module<T>>::random_seed(), &sender, nonce)
                                .using_encoded(<T as system::Trait>::Hashing::hash);

            let new_kitty = Kitty {
                                id: random_hash,
                                name: name,
                                dna: random_hash,
                                price: None,
                                gen: 0,
                            };

            Self::_mint(sender, random_hash)?;
            <Kitties<T>>::insert(random_hash, new_kitty);
            <Nonce<T>>::mutate(|n| *n += 1);

            Ok(())
        }

        fn set_price(origin, kitty_id: T::Hash, new_price: Option<T::Balance>) -> Result {
            let sender = ensure_signed(origin)?;

            ensure!(<Kitties<T>>::exists(kitty_id), "This cat does not exist");

            let owner = match Self::owner_of(kitty_id) {
                Some(c) => c,
                None => return Err("No owner for this kitty"),
            };
            ensure!(owner == sender, "You do not own this cat");

            let mut kitty = Self::kitty(kitty_id);
            kitty.price = new_price;

            <Kitties<T>>::insert(kitty_id, kitty);

            Ok(())
        }
        
        fn buy_cat(origin, kitty_id: T::Hash, max_price: T::Balance) -> Result {
            let sender = ensure_signed(origin)?;

            ensure!(<Kitties<T>>::exists(kitty_id), "This cat does not exist");

            let owner = match Self::owner_of(kitty_id) {
                Some(o) => o,
                None => return Err("No owner for this kitty"),
            };
            ensure!(owner != sender, "You can't buy your own cat");

            let mut kitty = Self::kitty(kitty_id);
            let kitty_price = match kitty.price {
                Some(p) => p,
                None => return Err("The cat you want to buy is not for sale"),
            };

            ensure!(kitty_price < max_price, "The cat you want to buy costs more than your max price");

            // TODO: This payment logic needs to be updated
            <balances::Module<T>>::decrease_free_balance(&sender, kitty_price)?;
            <balances::Module<T>>::increase_free_balance_creating(&owner, kitty_price);

            Self::_transfer_from(owner, sender, kitty_id)?;

            kitty.price = None;
            <Kitties<T>>::insert(kitty_id, kitty);

            Ok(())
        }

        fn breed_cat(origin, name: Vec<u8>, kitty_id_1: T::Hash, kitty_id_2: T::Hash) -> Result{
            let sender = ensure_signed(origin)?;

            ensure!(<Kitties<T>>::exists(kitty_id_1), "This cat 1 does not exist");
            ensure!(<Kitties<T>>::exists(kitty_id_2), "This cat 2 does not exist");

            let nonce = <Nonce<T>>::get();
            let random_hash = (<system::Module<T>>::random_seed(), &sender, nonce)
                                .using_encoded(<T as system::Trait>::Hashing::hash);

            let kitty_1 = Self::kitty(kitty_id_1);
            let kitty_2 = Self::kitty(kitty_id_2);

            let mut final_dna = kitty_1.dna;

            for (i, (dna_2_element, r)) in kitty_2.dna.as_ref().iter().zip(random_hash.as_ref().iter()).enumerate() {
                if r % 2 == 0 {
                    final_dna.as_mut()[i] = *dna_2_element;
                }
            }

            let new_kitty = Kitty {
                                id: random_hash,
                                name: name,
                                dna: final_dna,
                                price: None,
                                gen: cmp::max(kitty_1.gen, kitty_2.gen) + 1,
                            };

            Self::_mint(sender, random_hash)?;

            <Kitties<T>>::insert(random_hash, new_kitty);
            <Nonce<T>>::mutate(|n| *n += 1);

            Ok(())
        }
    }
}

impl<T: Trait> Module<T> {
    fn _mint(to: T::AccountId, kitty_id: T::Hash) -> Result {
        ensure!(!<KittyOwner<T>>::exists(kitty_id), "Kitty already exists");

        let owned_kitty_count = Self::owned_kitty_count(&to);

        let new_owned_kitty_count = match owned_kitty_count.checked_add(1) {
            Some(c) => c,
            None => return Err("Overflow adding a new kitty to account balance"),
        };

        Self::_add_kitty_to_all_kitties_enumeration(kitty_id)?;
        Self::_add_kitty_to_owner_enumeration(to.clone(), kitty_id)?;

        <KittyOwner<T>>::insert(kitty_id, &to);
        <OwnedKittiesCount<T>>::insert(&to, new_owned_kitty_count);

        Self::deposit_event(RawEvent::Created(to, kitty_id));

        Ok(())
    }

    fn _transfer_from(from: T::AccountId, to: T::AccountId, kitty_id: T::Hash) -> Result {
        let owner = match Self::owner_of(kitty_id) {
            Some(c) => c,
            None => return Err("No owner for this kitty"),
        };

        ensure!(owner == from, "'from' account does not own this kitty");

        let owned_kitty_count_from = Self::owned_kitty_count(&from);
        let owned_kitty_count_to = Self::owned_kitty_count(&to);

        let new_owned_kitty_count_from = match owned_kitty_count_from.checked_sub(1) {
            Some (c) => c,
            None => return Err("Transfer causes underflow of 'from' kitty balance"),
        };

        let new_owned_kitty_count_to = match owned_kitty_count_to.checked_add(1) {
            Some(c) => c,
            None => return Err("Transfer causes overflow of 'to' kitty balance"),
        };

        Self::_remove_kitty_from_owner_enumeration(from.clone(), kitty_id)?;
        Self::_add_kitty_to_owner_enumeration(to.clone(), kitty_id)?;

        <OwnedKittiesCount<T>>::insert(&from, new_owned_kitty_count_from);
        <OwnedKittiesCount<T>>::insert(&to, new_owned_kitty_count_to);
        <KittyOwner<T>>::insert(&kitty_id, &to);

        Self::deposit_event(RawEvent::Transferred(from, to, kitty_id));
        
        Ok(())
    }

    fn _add_kitty_to_owner_enumeration(to: T::AccountId, kitty_id: T::Hash) -> Result {
        let new_kitty_index = Self::owned_kitty_count(&to);

        <OwnedKittiesIndex<T>>::insert(kitty_id, new_kitty_index);
        <OwnedKitties<T>>::insert((to, new_kitty_index), kitty_id);

        Ok(())
    }

    fn _add_kitty_to_all_kitties_enumeration(kitty_id: T::Hash) -> Result {
        let all_kitties_count = Self::all_kitties_count();

        let new_all_kitties_count = match all_kitties_count.checked_add(1) {
            Some (c) => c,
            None => return Err("Overflow when adding new kitty to total supply"),
        };

        let new_kitty_index = all_kitties_count;

        <AllKittiesIndex<T>>::insert(kitty_id, new_kitty_index);
        <AllKitties<T>>::insert(new_kitty_index, kitty_id);
        <AllKittiesCount<T>>::put(new_all_kitties_count);

        Ok(())
    }

    fn _remove_kitty_from_owner_enumeration(from: T::AccountId, kitty_id: T::Hash) -> Result {
        let owned_kitty_count_from = Self::owned_kitty_count(&from);

        let last_kitty_index = match owned_kitty_count_from.checked_sub(1) {
            Some (c) => c,
            None => return Err("Transfer causes underflow of 'from' kitty balance"),
        };
        
        let kitty_index = <OwnedKittiesIndex<T>>::get(kitty_id);

        if kitty_index != last_kitty_index {
            let last_kitty_id = <OwnedKitties<T>>::get((from.clone(), last_kitty_index));
            <OwnedKitties<T>>::insert((from.clone(), kitty_index), last_kitty_id);
            <OwnedKittiesIndex<T>>::insert(last_kitty_id, kitty_index);
        }

        <OwnedKitties<T>>::remove((from, last_kitty_index));
        <OwnedKittiesIndex<T>>::remove(kitty_id);

        Ok(())
    }

    fn _remove_kitty_from_all_kitties_enumeration(kitty_id: T::Hash) -> Result {
        let all_kitties_count = Self::all_kitties_count();

        let new_all_kitties_count = match all_kitties_count.checked_sub(1) {
            Some(c) => c,
            None => return Err("Underflow removing kitty from total supply"),
        };

        let last_kitty_index = new_all_kitties_count;

        let kitty_index = <AllKittiesIndex<T>>::get(kitty_id);

        let last_kitty_id = <AllKitties<T>>::get(last_kitty_index);

        <AllKitties<T>>::insert(kitty_index, last_kitty_id);
        <AllKittiesIndex<T>>::insert(last_kitty_id, kitty_index);

        <AllKitties<T>>::remove(last_kitty_index);
        <AllKittiesIndex<T>>::remove(kitty_id);

        <AllKittiesCount<T>>::put(new_all_kitties_count);

        Ok(())
    }
}