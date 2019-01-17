use parity_codec::Encode;
use srml_support::{StorageValue, StorageMap, dispatch::Result};
use system::ensure_signed;
use runtime_primitives::traits::{Hash, Zero, As};
use rstd::prelude::*;
use rstd::cmp;

#[derive(Encode, Decode, Default, Clone, PartialEq, Debug)]
pub struct Kitty<Hash, Balance> {
    id: Hash,
    name: Vec<u8>,
    dna: Hash,
    price: Balance,
    gen: u32,
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
        Transfer(Option<AccountId>, Option<AccountId>, Hash),
    }
);

decl_storage! {
    trait Store for Module<T: Trait> as ERC721Storage {
        OwnedTokensCount get(balance_of): map T::AccountId => u64;
        TokenOwner get(owner_of): map T::Hash => Option<T::AccountId>;

        TotalSupply get(total_supply): u64;
        AllTokens get(token_by_index): map u64 => T::Hash;
        AllTokensIndex: map T::Hash => u64;
        OwnedTokens get(token_of_owner_by_index): map (T::AccountId, u64) => T::Hash;
        OwnedTokensIndex: map T::Hash => u64;

        Nonce: u64;
        Kitties get(kitty): map T::Hash => Kitty<T::Hash, T::Balance>;
    }
}

decl_module! {
    pub struct Module<T: Trait> for enum Call where origin: T::Origin {

        fn deposit_event<T>() = default;

        fn transfer(origin, to: T::AccountId, token_id: T::Hash) -> Result {
            let sender = ensure_signed(origin)?;

            let owner = match Self::owner_of(token_id) {
                Some(o) => o,
                None => return Err("No owner for this token"),
            };
            ensure!(owner == sender, "You do not own this token");

            Self::_transfer_from(sender, to, token_id)?;

            Ok(())
        }

        fn create_kitty(origin) -> Result {
            let sender = ensure_signed(origin)?;
            let nonce = <Nonce<T>>::get();
            let random_hash = (<system::Module<T>>::random_seed(), &sender, nonce).using_encoded(<T as system::Trait>::Hashing::hash);

            let new_kitty = Kitty {
                                id: random_hash,
                                name: Vec::new(),
                                dna: random_hash,
                                price: <T::Balance as As<u64>>::sa(0),
                                gen: 0,
                            };

            Self::_mint(sender, random_hash)?;
            <Kitties<T>>::insert(random_hash, new_kitty);
            <Nonce<T>>::mutate(|n| *n += 1);

            Ok(())
        }

        fn set_price(origin, token_id: T::Hash, new_price: T::Balance) -> Result {
            let sender = ensure_signed(origin)?;

            ensure!(<Kitties<T>>::exists(token_id), "This cat does not exist");

            let owner = match Self::owner_of(token_id) {
                Some(c) => c,
                None => return Err("No owner for this token"),
            };
            ensure!(owner == sender, "You do not own this cat");

            let mut kitty = Self::kitty(token_id);
            kitty.price = new_price;

            <Kitties<T>>::insert(token_id, kitty);

            Ok(())
        }
        
        fn buy_cat(origin, token_id: T::Hash, max_price: T::Balance) -> Result {
            let sender = ensure_signed(origin)?;

            ensure!(<Kitties<T>>::exists(token_id), "This cat does not exist");

            let owner = match Self::owner_of(token_id) {
                Some(o) => o,
                None => return Err("No owner for this token"),
            };
            ensure!(owner != sender, "You can't buy your own cat");

            let mut kitty = Self::kitty(token_id);
            ensure!(!kitty.price.is_zero(), "The cat you want to buy is not for sale");
            ensure!(kitty.price < max_price, "The cat you want to buy costs more than your max price");

            // TODO: This payment logic needs to be updated
            <balances::Module<T>>::decrease_free_balance(&sender, kitty.price)?;
            <balances::Module<T>>::increase_free_balance_creating(&owner, kitty.price);

            Self::_transfer_from(owner, sender, token_id)?;

            kitty.price = <T::Balance as As<u64>>::sa(0);
            <Kitties<T>>::insert(token_id, kitty);

            Ok(())
        }

        fn breed_cat(origin, token_id_1: T::Hash, token_id_2: T::Hash) -> Result{
            let sender = ensure_signed(origin)?;

            ensure!(<Kitties<T>>::exists(token_id_1), "This cat 1 does not exist");
            ensure!(<Kitties<T>>::exists(token_id_2), "This cat 2 does not exist");

            let nonce = <Nonce<T>>::get();
            let random_hash = (<system::Module<T>>::random_seed(), &sender, nonce).using_encoded(<T as system::Trait>::Hashing::hash);

            let kitty_1 = Self::kitty(token_id_1);
            let kitty_2 = Self::kitty(token_id_2);

            let mut final_dna = kitty_1.dna;

            for (i, (dna_2_element, r)) in kitty_2.dna.as_ref().iter().zip(random_hash.as_ref().iter()).enumerate() {
                if r % 2 == 0 {
                    final_dna.as_mut()[i] = *dna_2_element;
                }
            }

            let new_kitty = Kitty {
                                id: random_hash,
                                name: Vec::new(),
                                dna: final_dna,
                                price: <T::Balance as As<u64>>::sa(0),
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
    fn _mint(to: T::AccountId, token_id: T::Hash) -> Result {
        ensure!(!<TokenOwner<T>>::exists(token_id), "Token already exists");

        let balance_of = Self::balance_of(&to);

        let new_balance_of = match balance_of.checked_add(1) {
            Some(c) => c,
            None => return Err("Overflow adding a new token to account balance"),
        };

        Self::_add_token_to_all_tokens_enumeration(token_id)?;
        Self::_add_token_to_owner_enumeration(to.clone(), token_id)?;

        <TokenOwner<T>>::insert(token_id, &to);
        <OwnedTokensCount<T>>::insert(&to, new_balance_of);

        Self::deposit_event(RawEvent::Transfer(None, Some(to), token_id));

        Ok(())
    }

    fn _transfer_from(from: T::AccountId, to: T::AccountId, token_id: T::Hash) -> Result {
        let owner = match Self::owner_of(token_id) {
            Some(c) => c,
            None => return Err("No owner for this token"),
        };

        ensure!(owner == from, "'from' account does not own this token");

        let balance_of_from = Self::balance_of(&from);
        let balance_of_to = Self::balance_of(&to);

        let new_balance_of_from = match balance_of_from.checked_sub(1) {
            Some (c) => c,
            None => return Err("Transfer causes underflow of 'from' token balance"),
        };

        let new_balance_of_to = match balance_of_to.checked_add(1) {
            Some(c) => c,
            None => return Err("Transfer causes overflow of 'to' token balance"),
        };

        Self::_remove_token_from_owner_enumeration(from.clone(), token_id)?;
        Self::_add_token_to_owner_enumeration(to.clone(), token_id)?;

        <OwnedTokensCount<T>>::insert(&from, new_balance_of_from);
        <OwnedTokensCount<T>>::insert(&to, new_balance_of_to);
        <TokenOwner<T>>::insert(&token_id, &to);

        Self::deposit_event(RawEvent::Transfer(Some(from), Some(to), token_id));
        
        Ok(())
    }

    fn _add_token_to_owner_enumeration(to: T::AccountId, token_id: T::Hash) -> Result {
        let new_token_index = Self::balance_of(&to);

        <OwnedTokensIndex<T>>::insert(token_id, new_token_index);
        <OwnedTokens<T>>::insert((to, new_token_index), token_id);

        Ok(())
    }

    fn _add_token_to_all_tokens_enumeration(token_id: T::Hash) -> Result {
        let total_supply = Self::total_supply();

        let new_total_supply = match total_supply.checked_add(1) {
            Some (c) => c,
            None => return Err("Overflow when adding new token to total supply"),
        };

        let new_token_index = total_supply;

        <AllTokensIndex<T>>::insert(token_id, new_token_index);
        <AllTokens<T>>::insert(new_token_index, token_id);
        <TotalSupply<T>>::put(new_total_supply);

        Ok(())
    }

    fn _remove_token_from_owner_enumeration(from: T::AccountId, token_id: T::Hash) -> Result {
        let balance_of_from = Self::balance_of(&from);

        let last_token_index = match balance_of_from.checked_sub(1) {
            Some (c) => c,
            None => return Err("Transfer causes underflow of 'from' token balance"),
        };
        
        let token_index = <OwnedTokensIndex<T>>::get(token_id);

        if token_index != last_token_index {
            let last_token_id = <OwnedTokens<T>>::get((from.clone(), last_token_index));
            <OwnedTokens<T>>::insert((from.clone(), token_index), last_token_id);
            <OwnedTokensIndex<T>>::insert(last_token_id, token_index);
        }

        <OwnedTokens<T>>::remove((from, last_token_index));
        <OwnedTokensIndex<T>>::remove(token_id);

        Ok(())
    }

    fn _remove_token_from_all_tokens_enumeration(token_id: T::Hash) -> Result {
        let total_supply = Self::total_supply();

        let new_total_supply = match total_supply.checked_sub(1) {
            Some(c) => c,
            None => return Err("Underflow removing token from total supply"),
        };

        let last_token_index = new_total_supply;

        let token_index = <AllTokensIndex<T>>::get(token_id);

        let last_token_id = <AllTokens<T>>::get(last_token_index);

        <AllTokens<T>>::insert(token_index, last_token_id);
        <AllTokensIndex<T>>::insert(last_token_id, token_index);

        <AllTokens<T>>::remove(last_token_index);
        <AllTokensIndex<T>>::remove(token_id);

        <TotalSupply<T>>::put(new_total_supply);

        Ok(())
    }
}