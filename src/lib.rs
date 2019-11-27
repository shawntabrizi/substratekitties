#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Decode, Encode};
use runtime_io::hashing::{blake2_128};
use sr_primitives::traits::{Bounded, Member, One, SimpleArithmetic};
use support::traits::{Currency, ExistenceRequirement, Randomness};
/// A runtime module for managing non-fungible tokens
use support::{decl_event, decl_module, decl_storage, ensure, Parameter};
use system::ensure_signed;

/// The module's configuration trait.
pub trait Trait: system::Trait {
    type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;
    type KittyIndex: Parameter + Member + SimpleArithmetic + Bounded + Default + Copy;
    type Currency: Currency<Self::AccountId>;
    type Randomness: Randomness<Self::Hash>;
}

type BalanceOf<T> = <<T as Trait>::Currency as Currency<<T as system::Trait>::AccountId>>::Balance;

#[derive(Encode, Decode, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct Kitty(pub [u8; 16]);

decl_event!(
	pub enum Event<T> where
		<T as system::Trait>::AccountId,
		<T as Trait>::KittyIndex,
		Balance = BalanceOf<T>,
	{
		/// A kitty is created. (owner, kitty_id)
		Created(AccountId, KittyIndex),
		/// A kitty is transferred. (from, to, kitty_id)
		Transferred(AccountId, AccountId, KittyIndex),
		/// A kitty is available for sale. (owner, kitty_id, price)
		PriceSet(AccountId, KittyIndex, Option<Balance>),
		/// A kitty is sold. (from, to, kitty_id, price)
		Sold(AccountId, AccountId, KittyIndex, Balance),
	}
);

// This module's storage items.
decl_storage! {
    trait Store for Module<T: Trait> as Kitties {
        /// Stores all the kitties, key is the kitty id / index
        pub Kitties get(kitty): map T::KittyIndex => Option<Kitty>;
        /// Stores the total number of kitties. i.e. the next kitty index
        pub KittiesCount get(kitties_count): T::KittyIndex;

        /// Get kitty owner
        pub KittyOwners get(kitty_owner): map T::KittyIndex => Option<T::AccountId>;

        /// Get kitty price. None means not for sale.
        pub KittyPrices get(kitty_price): map T::KittyIndex => Option<BalanceOf<T>>
    }
}

// The module's dispatchable functions.
decl_module! {
    /// The module declaration.
    pub struct Module<T: Trait> for enum Call where origin: T::Origin {
        fn deposit_event() = default;

        /// Create a new kitty
        pub fn create(origin) {
            let sender = ensure_signed(origin)?;
            let kitty_id = Self::next_kitty_id()?;

            // Generate a random 128bit value
            let dna = Self::random_value(&sender);

            // Create and store kitty
            let kitty = Kitty(dna);
            Self::insert_kitty(&sender, kitty_id, kitty);

            Self::deposit_event(RawEvent::Created(sender, kitty_id));
        }

        /// Transfer a kitty to new owner
        pub fn transfer(origin, to: T::AccountId, kitty_id: T::KittyIndex) {
            let sender = ensure_signed(origin)?;

            ensure!(Self::kitty_owner(kitty_id) == Some(sender.clone()), "Only owner can transfer kitty");

            Self::update_owner(&to, kitty_id);

            Self::deposit_event(RawEvent::Transferred(sender, to, kitty_id));
        }

        /// Breed kitties
        pub fn breed(origin, kitty_id_1: T::KittyIndex, kitty_id_2: T::KittyIndex) {
            let sender = ensure_signed(origin)?;

            let new_kitty_id = Self::do_breed(&sender, kitty_id_1, kitty_id_2)?;

            Self::deposit_event(RawEvent::Created(sender, new_kitty_id));
        }

        /// Set a price for a kitty for sale
        /// None to delist the kitty
        pub fn set_price(origin, kitty_id: T::KittyIndex, price: Option<BalanceOf<T>>) {
            let sender = ensure_signed(origin)?;

            ensure!(Self::kitty_owner(kitty_id) == Some(sender.clone()), "Only owner can set price for kitty");

            if let Some(ref price) = price {
                <KittyPrices<T>>::insert(kitty_id, price);
            } else {
                <KittyPrices<T>>::remove(kitty_id);
            }

            Self::deposit_event(RawEvent::PriceSet(sender, kitty_id, price));
        }

        /// Buy a kitty with max price willing to pay
        pub fn buy(origin, kitty_id: T::KittyIndex, price: BalanceOf<T>) {
            let sender = ensure_signed(origin)?;

            let owner = Self::kitty_owner(kitty_id);
            ensure!(owner.is_some(), "Kitty does not exist");
            let owner = owner.unwrap();

            let kitty_price = Self::kitty_price(kitty_id);
            ensure!(kitty_price.is_some(), "Kitty not for sale");

            let kitty_price = kitty_price.unwrap();
            ensure!(price >= kitty_price, "Price is too low");

            T::Currency::transfer(&sender, &owner, kitty_price, ExistenceRequirement::AllowDeath)?;

            <KittyPrices<T>>::remove(kitty_id);

            Self::update_owner(&sender, kitty_id);

            Self::deposit_event(RawEvent::Sold(owner, sender, kitty_id, kitty_price));
        }
    }
}

impl<T: Trait> Module<T> {
    fn random_value(sender: &T::AccountId) -> [u8; 16] {
        let payload = (
            T::Randomness::random(&[0]),
            sender,
            <system::Module<T>>::extrinsic_index(),
            <system::Module<T>>::block_number(),
        );
        payload.using_encoded(blake2_128)
    }

    fn next_kitty_id() -> Result<T::KittyIndex, &'static str> {
        let kitty_id = Self::kitties_count();
        if kitty_id == <T::KittyIndex as Bounded>::max_value() {
            return Err("Kitties count overflow");
        }
        Ok(kitty_id)
    }

    fn insert_kitty(owner: &T::AccountId, kitty_id: T::KittyIndex, kitty: Kitty) {
        // Create and store kitty
        <Kitties<T>>::insert(kitty_id, kitty);
        <KittiesCount<T>>::put(kitty_id + One::one());
        <KittyOwners<T>>::insert(kitty_id, owner.clone());
    }

    fn update_owner(to: &T::AccountId, kitty_id: T::KittyIndex) {
        <KittyOwners<T>>::insert(kitty_id, to);
    }

    fn combine_dna(dna1: u8, dna2: u8, selector: u8) -> u8 {
        if selector % 2 == 0 {
            return dna1;
        }

        dna2
    }

    fn do_breed(
        sender: &T::AccountId,
        kitty_id_1: T::KittyIndex,
        kitty_id_2: T::KittyIndex,
    ) -> Result<T::KittyIndex, &'static str> {
        let kitty1 = Self::kitty(kitty_id_1);
        let kitty2 = Self::kitty(kitty_id_2);

        ensure!(kitty1.is_some(), "Invalid kitty_id_1");
        ensure!(kitty2.is_some(), "Invalid kitty_id_2");
        ensure!(kitty_id_1 != kitty_id_2, "Needs different parent");
        ensure!(
            Self::kitty_owner(&kitty_id_1)
                .map(|owner| owner == *sender)
                .unwrap_or(false),
            "Not owner of kitty1"
        );
        ensure!(
            Self::kitty_owner(&kitty_id_2)
                .map(|owner| owner == *sender)
                .unwrap_or(false),
            "Not owner of kitty2"
        );

        let kitty_id = Self::next_kitty_id()?;

        let kitty1_dna = kitty1.unwrap().0;
        let kitty2_dna = kitty2.unwrap().0;

        // Generate a random 128bit value
        let selector = Self::random_value(&sender);
        let mut new_dna = [0u8; 16];

        // Combine parents and selector to create new kitty
        for i in 0..kitty1_dna.len() {
            new_dna[i] = Self::combine_dna(kitty1_dna[i], kitty2_dna[i], selector[i]);
        }

        Self::insert_kitty(sender, kitty_id, Kitty(new_dna));

        Ok(kitty_id)
    }
}

/// tests for this module
#[cfg(test)]
mod tests {
    use super::*;

    use primitives::{Blake2Hasher, H256};
    use runtime_io::with_externalities;
    use sr_primitives::Perbill;
    use sr_primitives::{
        testing::Header,
        traits::{BlakeTwo256, IdentityLookup},
    };
    use support::{assert_noop, assert_ok, impl_outer_origin, parameter_types, weights::Weight};

    impl_outer_origin! {
        pub enum Origin for Test {}
    }

    // For testing the module, we construct most of a mock runtime. This means
    // first constructing a configuration type (`Test`) which `impl`s each of the
    // configuration traits of modules we want to use.
    #[derive(Clone, Eq, PartialEq)]
    pub struct Test;
    parameter_types! {
        pub const BlockHashCount: u64 = 250;
        pub const MaximumBlockWeight: Weight = 1024;
        pub const MaximumBlockLength: u32 = 2 * 1024;
        pub const AvailableBlockRatio: Perbill = Perbill::from_percent(75);
    }
    impl system::Trait for Test {
        type Origin = Origin;
        type Call = ();
        type Index = u64;
        type BlockNumber = u64;
        type Hash = H256;
        type Hashing = BlakeTwo256;
        type AccountId = u64;
        type Lookup = IdentityLookup<Self::AccountId>;
        type Header = Header;
        type WeightMultiplierUpdate = ();
        type Event = ();
        type BlockHashCount = BlockHashCount;
        type MaximumBlockWeight = MaximumBlockWeight;
        type MaximumBlockLength = MaximumBlockLength;
        type AvailableBlockRatio = AvailableBlockRatio;
        type Version = ();
    }
    impl balances::Trait for Test {
        type Balance = u64;
        type OnFreeBalanceZero = ();
        type OnNewAccount = ();
        type Event = ();
        type ExistentialDeposit = ();
        type TransferFee = ();
        type CreationFee = ();
        type TransactionPayment = ();
        type DustRemoval = ();
        type TransferPayment = ();
        type TransactionBaseFee = ();
        type TransactionByteFee = ();
        type WeightToFee = ();
    }
    impl Trait for Test {
        type KittyIndex = u64;
        type Currency = Balances;
        type Event = ();
    }
    //type System = system::Module<Test>;
    type Balances = balances::Module<Test>;
    type KittyModule = Module<Test>;

    // This function basically just builds a genesis storage key/value store according to
    // our desired mockup.
    fn new_test_ext() -> runtime_io::TestExternalities<Blake2Hasher> {
        let mut t = system::GenesisConfig::default()
            .build_storage::<Test>()
            .unwrap();
        balances::GenesisConfig::<Test> {
            balances: vec![(1, 10), (2, 20), (3, 30), (4, 40), (5, 50), (6, 60)],
            vesting: vec![],
        }
        .assimilate_storage(&mut t)
        .unwrap();
        runtime_io::TestExternalities::new(t)
    }

    #[test]
    fn basic_setup_works() {
        with_externalities(&mut new_test_ext(), || {
            // Verify Initial Storage
            assert_eq!(KittyModule::kitties_count(), 0);
            assert!(KittyModule::kitty(0).is_none());
            assert_eq!(KittyModule::kitty_owner(0), None);
            assert_eq!(KittyModule::kitty_price(0), None);
            assert_eq!(Balances::free_balance(1), 10);
            assert_eq!(Balances::free_balance(2), 20);
        });
    }

    #[test]
    fn create_works() {
        with_externalities(&mut new_test_ext(), || {
            // Call Functions
            assert_ok!(KittyModule::create(Origin::signed(1)));
            // Verify Storage
            assert_eq!(KittyModule::kitties_count(), 1);
            assert!(KittyModule::kitty(0).is_some());
            assert_eq!(KittyModule::kitty_owner(0), Some(1));
            assert_eq!(KittyModule::kitty_price(0), None);
        });
    }

    #[test]
    fn create_handles_basic_errors() {
        with_externalities(&mut new_test_ext(), || {
            // Setup
            <KittiesCount<Test>>::put(u64::max_value());
            // Call Functions
            assert_noop!(
                KittyModule::create(Origin::signed(1)),
                "Kitties count overflow"
            );
            // Verify Storage
            assert_eq!(KittyModule::kitties_count(), u64::max_value());
            assert!(KittyModule::kitty(0).is_none());
            assert_eq!(KittyModule::kitty_owner(0), None);
            assert_eq!(KittyModule::kitty_price(0), None);
        });
    }

    #[test]
    fn transfer_works() {
        with_externalities(&mut new_test_ext(), || {
            // Setup
            assert_ok!(KittyModule::create(Origin::signed(1)));
            // Call Functions
            assert_ok!(KittyModule::transfer(Origin::signed(1), 2, 0));
            // Verify Storage
            assert_eq!(KittyModule::kitties_count(), 1);
            assert!(KittyModule::kitty(0).is_some());
            assert_eq!(KittyModule::kitty_owner(0), Some(2));
            assert_eq!(KittyModule::kitty_price(0), None);
        });
    }

    #[test]
    fn transfer_handles_basic_errors() {
        with_externalities(&mut new_test_ext(), || {
            // Setup
            assert_ok!(KittyModule::create(Origin::signed(1)));
            // Call Functions
            assert_noop!(
                KittyModule::transfer(Origin::signed(2), 2, 0),
                "Only owner can transfer kitty"
            );
            assert_noop!(
                KittyModule::transfer(Origin::signed(1), 2, 1),
                "Only owner can transfer kitty"
            );
            // Verify Storage
            assert_eq!(KittyModule::kitties_count(), 1);
            assert!(KittyModule::kitty(0).is_some());
            assert_eq!(KittyModule::kitty_owner(0), Some(1));
            assert_eq!(KittyModule::kitty_price(0), None);
        });
    }

    #[test]
    fn breed_works() {
        with_externalities(&mut new_test_ext(), || {
            // Setup
            assert_ok!(KittyModule::create(Origin::signed(1)));
            assert_ok!(KittyModule::create(Origin::signed(1)));
            // Call Functions
            assert_ok!(KittyModule::breed(Origin::signed(1), 0, 1));
            // Verify Storage
            assert_eq!(KittyModule::kitties_count(), 3);
            assert!(KittyModule::kitty(0).is_some());
            assert!(KittyModule::kitty(1).is_some());
            assert!(KittyModule::kitty(2).is_some());
            assert_eq!(KittyModule::kitty_owner(0), Some(1));
            assert_eq!(KittyModule::kitty_owner(1), Some(1));
            assert_eq!(KittyModule::kitty_owner(2), Some(1));
            assert_eq!(KittyModule::kitty_price(0), None);
            assert_eq!(KittyModule::kitty_price(1), None);
            assert_eq!(KittyModule::kitty_price(2), None);
        });
    }

    #[test]
    fn breed_handles_basic_errors() {
        with_externalities(&mut new_test_ext(), || {
            // Setup
            assert_ok!(KittyModule::create(Origin::signed(1)));
            assert_ok!(KittyModule::create(Origin::signed(2)));
            // Call Functions
            assert_noop!(
                KittyModule::breed(Origin::signed(1), 0, 0),
                "Needs different parent"
            );
            assert_noop!(
                KittyModule::breed(Origin::signed(2), 0, 1),
                "Not owner of kitty1"
            );
            assert_noop!(
                KittyModule::breed(Origin::signed(1), 0, 1),
                "Not owner of kitty2"
            );
            assert_noop!(
                KittyModule::breed(Origin::signed(1), 2, 1),
                "Invalid kitty_id_1"
            );
            assert_noop!(
                KittyModule::breed(Origin::signed(1), 0, 2),
                "Invalid kitty_id_2"
            );
            // Verify Storage
            assert_eq!(KittyModule::kitties_count(), 2);
            assert!(KittyModule::kitty(0).is_some());
            assert!(KittyModule::kitty(1).is_some());
            assert!(KittyModule::kitty(2).is_none());
            assert_eq!(KittyModule::kitty_owner(0), Some(1));
            assert_eq!(KittyModule::kitty_owner(1), Some(2));
            assert_eq!(KittyModule::kitty_price(0), None);
            assert_eq!(KittyModule::kitty_price(1), None);
        });
    }

    #[test]
    fn set_price_works() {
        with_externalities(&mut new_test_ext(), || {
            // Setup
            assert_ok!(KittyModule::create(Origin::signed(1)));
            // Call Functions
            assert_ok!(KittyModule::set_price(Origin::signed(1), 0, Some(10)));
            // Verify Storage
            assert_eq!(KittyModule::kitties_count(), 1);
            assert!(KittyModule::kitty(0).is_some());
            assert_eq!(KittyModule::kitty_owner(0), Some(1));
            assert_eq!(KittyModule::kitty_price(0), Some(10));
        });
    }

    #[test]
    fn buy_works() {
        with_externalities(&mut new_test_ext(), || {
            // Setup
            assert_ok!(KittyModule::create(Origin::signed(1)));
            assert_ok!(KittyModule::set_price(Origin::signed(1), 0, Some(10)));
            // Call Functions
            assert_ok!(KittyModule::buy(Origin::signed(2), 0, 10));
            // Verify Storage
            assert_eq!(KittyModule::kitties_count(), 1);
            assert!(KittyModule::kitty(0).is_some());
            assert_eq!(KittyModule::kitty_owner(0), Some(2));
            assert_eq!(KittyModule::kitty_price(0), None);
            assert_eq!(Balances::free_balance(1), 20);
            assert_eq!(Balances::free_balance(2), 10);
        });
    }
}
