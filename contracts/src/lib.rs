#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Map, Symbol, Vec};

#[contract]
pub struct AidChainContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Donation {
    pub donor: Address,
    pub amount: i128,
    pub category: Symbol,
    pub region: Symbol,
    pub organization: Symbol,
    pub timestamp: u64,
    pub status: Symbol,
    pub delivery_nft_id: Option<Symbol>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DonationStats {
    pub total_donations: i128,
    pub total_amount: i128,
    pub category_stats: Map<Symbol, i128>,
    pub region_stats: Map<Symbol, i128>,
}

#[contractimpl]
impl AidChainContract {
    // Create a new donation
    pub fn create_donation(
        env: &Env,
        donor: Address,
        amount: i128,
        category: Symbol,
        region: Symbol,
        organization: Symbol,
    ) -> Donation {
        // Validate inputs
        if amount <= 0 {
            panic!("Amount must be positive");
        }

        let donation = Donation {
            donor: donor.clone(),
            amount,
            category: category.clone(),
            region: region.clone(),
            organization: organization.clone(),
            timestamp: env.ledger().timestamp(),
            status: symbol_short!("pending"),
            delivery_nft_id: None,
        };

        // Store donation
        let donations_key = symbol_short!("donations");
        let mut donations: Vec<Donation> = env.storage().instance().get(&donations_key).unwrap_or(Vec::new(&env));
        donations.push_back(donation.clone());
        env.storage().instance().set(&donations_key, &donations);

        // Update stats
        Self::update_stats(env, &donation);

        donation
    }

    // Get all donations
    pub fn get_donations(env: &Env) -> Vec<Donation> {
        let donations_key = symbol_short!("donations");
        env.storage().instance().get(&donations_key).unwrap_or(Vec::new(&env))
    }

    // Get donations by donor
    pub fn get_donations_by_donor(env: &Env, donor: Address) -> Vec<Donation> {
        let all_donations = Self::get_donations(env);
        let mut donor_donations = Vec::new(&env);
        
        for donation in all_donations.iter() {
            if donation.donor == donor {
                donor_donations.push_back(donation);
            }
        }
        
        donor_donations
    }

    // Confirm delivery of a donation
    pub fn confirm_delivery(env: &Env, donation_index: u32, nft_id: Symbol) -> Donation {
        let donations_key = symbol_short!("donations");
        let mut donations: Vec<Donation> = env.storage().instance().get(&donations_key).unwrap_or(Vec::new(&env));
        
        if donation_index >= donations.len() {
            panic!("Donation index out of bounds");
        }
        
        let mut donation = donations.get(donation_index).unwrap();
        donation.status = symbol_short!("delivered");
        donation.delivery_nft_id = Some(nft_id);
        
        donations.set(donation_index, donation.clone());
        env.storage().instance().set(&donations_key, &donations);
        
        donation
    }

    // Get donation statistics
    pub fn get_stats(env: &Env) -> DonationStats {
        let stats_key = symbol_short!("stats");
        env.storage().instance().get(&stats_key).unwrap_or(DonationStats {
            total_donations: 0,
            total_amount: 0,
            category_stats: Map::new(&env),
            region_stats: Map::new(&env),
        })
    }

    // Update statistics when new donation is created
    fn update_stats(env: &Env, donation: &Donation) {
        let stats_key = symbol_short!("stats");
        let mut stats: DonationStats = env.storage().instance().get(&stats_key).unwrap_or(DonationStats {
            total_donations: 0,
            total_amount: 0,
            category_stats: Map::new(&env),
            region_stats: Map::new(&env),
        });

        stats.total_donations += 1;
        stats.total_amount += donation.amount;

        // Update category stats
        let current_category_count = stats.category_stats.get(donation.category.clone()).unwrap_or(0);
        stats.category_stats.set(donation.category.clone(), current_category_count + 1);

        // Update region stats
        let current_region_count = stats.region_stats.get(donation.region.clone()).unwrap_or(0);
        stats.region_stats.set(donation.region.clone(), current_region_count + 1);

        env.storage().instance().set(&stats_key, &stats);
    }

    // Get donations by category
    pub fn get_donations_by_category(env: &Env, category: Symbol) -> Vec<Donation> {
        let all_donations = Self::get_donations(env);
        let mut category_donations = Vec::new(&env);
        
        for donation in all_donations.iter() {
            if donation.category == category {
                category_donations.push_back(donation);
            }
        }
        
        category_donations
    }

    // Get donations by region
    pub fn get_donations_by_region(env: &Env, region: Symbol) -> Vec<Donation> {
        let all_donations = Self::get_donations(env);
        let mut region_donations = Vec::new(&env);
        
        for donation in all_donations.iter() {
            if donation.region == region {
                region_donations.push_back(donation);
            }
        }
        
        region_donations
    }

    // Get total amount donated
    pub fn get_total_amount(env: &Env) -> i128 {
        let stats = Self::get_stats(env);
        stats.total_amount
    }

    // Get donation count
    pub fn get_donation_count(env: &Env) -> i128 {
        let stats = Self::get_stats(env);
        stats.total_donations
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Address, Env, Symbol};

    #[test]
    fn test_create_donation() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AidChainContract);
        let client = AidChainContractClient::new(&env, &contract_id);

        let donor = Address::random(&env);
        let amount = 100;
        let category = Symbol::new(&env, "money");
        let region = Symbol::new(&env, "istanbul");
        let organization = Symbol::new(&env, "red_cross");

        let donation = client.create_donation(&donor, &amount, &category, &region, &organization);
        
        assert_eq!(donation.donor, donor);
        assert_eq!(donation.amount, amount);
        assert_eq!(donation.category, category);
        assert_eq!(donation.region, region);
        assert_eq!(donation.organization, organization);
        assert_eq!(donation.status, symbol_short!("pending"));
    }

    #[test]
    fn test_get_stats() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AidChainContract);
        let client = AidChainContractClient::new(&env, &contract_id);

        let donor = Address::random(&env);
        let amount = 100;
        let category = Symbol::new(&env, "money");
        let region = Symbol::new(&env, "istanbul");
        let organization = Symbol::new(&env, "red_cross");

        client.create_donation(&donor, &amount, &category, &region, &organization);
        
        let stats = client.get_stats();
        assert_eq!(stats.total_donations, 1);
        assert_eq!(stats.total_amount, 100);
    }
} 