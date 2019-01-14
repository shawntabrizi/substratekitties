use parity_codec::Encode;
use srml_support::{StorageValue, StorageMap, dispatch::Result};
use system::ensure_signed;
use runtime_primitives::traits::{Hash, Zero, As};
use rstd::prelude::*;

pub trait Trait: balances::Trait {
  type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;
}

#[derive(Encode, Decode, Default, Clone, PartialEq, Debug)]
pub struct Kitty<Hash, Balance> {
  name: Vec<u8>,
  dna: Hash,
  price: Balance,
}

decl_module! {
  pub struct Module<T: Trait> for enum Call where origin: T::Origin {

    fn deposit_event<T>() = default;

    // Begin ERC721 implementation: Public Functions //
    fn safe_transfer_from(origin, from: T::AccountId, to: T::AccountId, token_id: u32) -> Result {
      let to_balance = <balances::Module<T>>::free_balance(&to);
      ensure!(!to_balance.is_zero(), "'to' account does not satisfy the `ExistentialDeposit` requirement");

      Self::transfer_from(origin, from, to, token_id)?;

      Ok(())
    }

    fn transfer_from(origin, from: T::AccountId, to: T::AccountId, token_id: u32) -> Result {
      let sender = ensure_signed(origin)?;
      ensure!(Self::_is_approved_or_owner(sender, token_id), "You do not own this token");

      Self::_transfer_from(from, to, token_id)?;

      Ok(())
    }

    fn approve(origin, to: T::AccountId, token_id: u32) -> Result {
      let sender = ensure_signed(origin)?;
      let owner = Self::owner_of(token_id);
      ensure!(to != owner, "Owner is implicitly approved");
      ensure!(sender == owner || Self::is_approved_for_all((owner.clone(), sender.clone())), "You are not allowed to approve for this token");

      <GetApproved<T>>::insert(&token_id, &to);

      Self::deposit_event(RawEvent::Approval(owner, to, token_id));

      Ok(())
    }

    fn set_approval_for_all(origin, to: T::AccountId, approved: bool) -> Result {
      let sender = ensure_signed(origin)?;
      ensure!(to != sender, "You are already implicity approved for your own actions");
      <IsApprovedForAll<T>>::insert((sender.clone(), to.clone()), approved);

      Self::deposit_event(RawEvent::ApprovalForAll(sender, to, approved));

      Ok(())
    }
    // End ERC721 implementation: Public Functions //

    fn create_random_cat(origin) -> Result {
      let sender = ensure_signed(origin)?;

      let random_seed = <system::Module<T>>::random_seed();
      let dna = (random_seed, &sender).using_encoded(<T as system::Trait>::Hashing::hash);
      
      Self::_mint_token(sender, dna)?;

      Ok(())
    }

    fn set_price(origin, token_id: u32, new_price: T::Balance) -> Result {
      let sender = ensure_signed(origin)?;

      ensure!(<Tokens<T>>::exists(token_id), "This token does not exist");

      let token_owner = Self::owner_of(token_id);
      ensure!(token_owner == sender, "You do not own this token");

      let mut token = Self::token(token_id);
      token.price = new_price;

      <Tokens<T>>::insert(token_id, token);

      Ok(())
    }

    fn buy_cat(origin, token_id: u32, max_price: T::Balance) -> Result {
      let sender = ensure_signed(origin)?;

      ensure!(<Tokens<T>>::exists(token_id), "This token does not exist");
      
      let token_owner = Self::owner_of(token_id);
      ensure!(sender != token_owner, "You can't buy your own token");

      let mut token = Self::token(token_id);
      ensure!(!token.price.is_zero(), "The token you want to buy is not for sale");
      ensure!(token.price <= max_price, "The token you want to buy costs more than your max price");

      <balances::Module<T>>::decrease_free_balance(&sender, token.price)?;
      <balances::Module<T>>::increase_free_balance_creating(&token_owner, token.price);
      token.price = <T::Balance as As<u64>>::sa(0);

      <Tokens<T>>::insert(token_id, token);
      
      Self::_transfer_from(token_owner, sender, token_id)?;

      Ok(())
    }

    fn breed_cat(origin, token_id_1: u32, token_id_2: u32) -> Result{
      let sender = ensure_signed(origin)?;

      ensure!(<Tokens<T>>::exists(token_id_1), "Cat 1 does not exist");
      ensure!(<Tokens<T>>::exists(token_id_2), "Cat 2 does not exist");

      let dna1 = Self::token(token_id_1).dna;
      let dna2 = Self::token(token_id_2).dna;

      let random_seed = <system::Module<T>>::random_seed();
      let random = (random_seed, &sender).using_encoded(<T as system::Trait>::Hashing::hash);

      let mut final_dna = dna1;

      for (i, (dna2_element, r)) in dna2.as_ref().iter().zip(random.as_ref().iter()).enumerate() {
        if r % 2 == 0 {
          final_dna.as_mut()[i] = *dna2_element;
        }
      }

      Self::_mint_token(sender, final_dna)?;

      Ok(())
    }
  }
}

decl_storage! {
  trait Store for Module<T: Trait> as CryptokittiesStorage {
    // Begin ERC721 implementation: Storage & Getters //
    BalanceOf get(balance_of): map T::AccountId => u32;
    OwnerOf get(owner_of): map u32 => T::AccountId;
    GetApproved get(get_approved): map u32 => T::AccountId;
    IsApprovedForAll get(is_approved_for_all): map (T::AccountId, T::AccountId) => bool;
    // End ERC721 implementation: Storage & Getters //

    TotalSupply get(total_supply): u32 = 0;
    TokensOfOwner get(tokens_of_owner): map T::AccountId => Vec<u32>;
    Tokens get(token): map u32 => Kitty<T::Hash, T::Balance>;
  }
}

decl_event!(
	pub enum Event<T>
  where
    <T as system::Trait>::AccountId
  {
    // Begin ERC721 implementation: Events //
		Transfer(AccountId, AccountId, u32),
    Approval(AccountId, AccountId, u32),
    ApprovalForAll(AccountId, AccountId, bool),
    // End ERC721 implementation: Events //

    Birth(AccountId, u32),
	}
);

impl<T: Trait> Module<T> {
  fn _mint_token(owner: T::AccountId, hash: T::Hash) -> Result {
    let new_token = Self::_create_token(hash);

    let current_balance_of = Self::balance_of(&owner);
    let total_supply = Self::total_supply();
    let mut tokens_of_owner = Self::tokens_of_owner(&owner);

    let token_id = total_supply;

    let new_total_supply = match total_supply.checked_add(1) {
      Some(c) => c,
      None => return Err("Overflow adding a new token to total"),
    };

    let new_balance_of = match current_balance_of.checked_add(1) {
      Some(c) => c,
      None => return Err("Overflow adding a new token to owner balance"),
    };

    tokens_of_owner.push(token_id);

    <BalanceOf<T>>::insert(&owner, new_balance_of);
    <OwnerOf<T>>::insert(token_id, &owner);
    <TotalSupply<T>>::put(new_total_supply);
    <TokensOfOwner<T>>::insert(&owner, tokens_of_owner);
    <Tokens<T>>::insert(token_id, new_token);
    
    Self::deposit_event(RawEvent::Birth(owner, token_id));

    Ok(())
  }

  fn _create_token(hash: T::Hash) -> Kitty<T::Hash, T::Balance> {

    return Kitty {
            name: Vec::new(),
            dna: hash,
            price: <T::Balance as As<u64>>::sa(0)
          };
  }

  // Begin ERC721 implementation: Internal Functions //
  fn _transfer_from(from: T::AccountId, to: T::AccountId, token_id: u32) -> Result {
    ensure!(Self::owner_of(token_id) == from, "'from' account does not own this token");

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

    let mut from_owned_tokens = Self::tokens_of_owner(&from);
    let mut to_owned_tokens = Self::tokens_of_owner(&to);

    let rm_index = from_owned_tokens.iter().position(|x| *x == token_id).unwrap();
    from_owned_tokens.remove(rm_index);
    to_owned_tokens.push(token_id);

    
    <BalanceOf<T>>::insert(&from, new_balance_of_from);
    <BalanceOf<T>>::insert(&to, new_balance_of_to);
    <OwnerOf<T>>::insert(&token_id, &to);
    <GetApproved<T>>::remove(&token_id);
    <TokensOfOwner<T>>::insert(&from, from_owned_tokens);
    <TokensOfOwner<T>>::insert(&to, to_owned_tokens);

    Self::deposit_event(RawEvent::Transfer(from, to, token_id));

    Ok(())
  }

  fn _is_approved_or_owner(spender: T::AccountId, token_id: u32) -> bool {
    let owner = Self::owner_of(token_id);

    return spender == owner || Self::get_approved(token_id) == spender || Self::is_approved_for_all((owner, spender))
  }
  // End ERC721 implementation: Internal Functions //
}