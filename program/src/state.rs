use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::pubkey::Pubkey,
    solana_program::msg,
    solana_program::program_error::ProgramError,
    solana_program::program_pack::{IsInitialized, Pack, Sealed},
};

/// prefix used for PDAs to avoid certain collision attacks (https://en.wikipedia.org/wiki/Collision_attack#Chosen-prefix_collision_attack)
pub const PREFIX: &str = "solclout";

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct SolcloutInstance {
    /// Solclout token mint pubkey that can be traded for creator tokens
    pub solclout_token: Pubkey,
    /// Account to hold solclout after people buy
    pub solclout_storage: Pubkey,

    pub token_program_id: Pubkey,
    pub name_program_id: Pubkey,
    pub initialized: bool
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct SolcloutCreator {
    /// Fields not updatable by the user
    /// The creator token mint pubkey
    pub creator_token: Pubkey,
    /// Solclout token mint pubkey that can be traded for this creator token
    pub solclout_instance: Pubkey,
    /// Destination for founder rewards
    pub founder_rewards_account: Pubkey,
    /// Name service name pubkey
    pub name: Pubkey,
    /// Percentage of purchases that go to the founder
    /// Percentage Value is (founder_reward_percentage / 10,000) * 100
    pub founder_reward_percentage: u16,
    pub initialized: bool,
    pub authority_nonce: u8,
}
impl Sealed for SolcloutCreator {}

impl Pack for SolcloutCreator {
    const LEN: usize = 32 * 4 + 2 + 1 + 1;

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let mut slice = dst;
        self.serialize(&mut slice).unwrap()
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let mut p = src;
        SolcloutCreator::deserialize(&mut p).map_err(|_| {
            msg!("Failed to deserialize name record");
            ProgramError::InvalidAccountData
        })
    }
}

impl Sealed for SolcloutInstance {}

impl Pack for SolcloutInstance {
    const LEN: usize = 32 * 4 + 2 + 1;

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let mut slice = dst;
        self.serialize(&mut slice).unwrap()
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let mut p = src;
        SolcloutInstance::deserialize(&mut p).map_err(|_| {
            msg!("Failed to deserialize name record");
            ProgramError::InvalidAccountData
        })
    }
}

