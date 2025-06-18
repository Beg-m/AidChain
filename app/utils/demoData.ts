import { DonationData } from './stellar';

// Demo donation data for testing
export const demoDonations: DonationData[] = [
  {
    id: 'demo-1',
    amount: '25.5',
    category: 'para',
    region: 'istanbul',
    timestamp: '2024-01-15T10:30:00.000Z',
    transactionHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    status: 'completed',
    donorAddress: 'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY'
  },
  {
    id: 'demo-2',
    amount: '15.0',
    category: 'battaniye',
    region: 'ankara',
    timestamp: '2024-01-14T14:20:00.000Z',
    transactionHash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890',
    status: 'completed',
    donorAddress: 'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY'
  },
  {
    id: 'demo-3',
    amount: '8.75',
    category: 'gida',
    region: 'izmir',
    timestamp: '2024-01-13T09:15:00.000Z',
    transactionHash: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890ab',
    status: 'completed',
    donorAddress: 'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY'
  },
  {
    id: 'demo-4',
    amount: '12.25',
    category: 'giysi',
    region: 'antalya',
    timestamp: '2024-01-12T16:45:00.000Z',
    transactionHash: 'd4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcd',
    status: 'completed',
    donorAddress: 'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY'
  },
  {
    id: 'demo-5',
    amount: '30.0',
    category: 'para',
    region: 'bursa',
    timestamp: '2024-01-11T11:30:00.000Z',
    transactionHash: 'e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcde',
    status: 'completed',
    donorAddress: 'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY'
  },
  {
    id: 'demo-6',
    amount: '5.5',
    category: 'ilac',
    region: 'adana',
    timestamp: '2024-01-10T13:20:00.000Z',
    transactionHash: 'f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef',
    status: 'completed',
    donorAddress: 'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY'
  },
  {
    id: 'demo-7',
    amount: '18.75',
    category: 'temizlik',
    region: 'gaziantep',
    timestamp: '2024-01-09T15:10:00.000Z',
    transactionHash: '6789012345678901234567890abcdef1234567890abcdef1234567890abcdef12',
    status: 'completed',
    donorAddress: 'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY'
  },
  {
    id: 'demo-8',
    amount: '22.0',
    category: 'para',
    region: 'konya',
    timestamp: '2024-01-08T12:00:00.000Z',
    transactionHash: '7890123456789012345678901234567890abcdef1234567890abcdef123456789',
    status: 'completed',
    donorAddress: 'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY'
  }
];

// Function to populate demo data
export const populateDemoData = () => {
  try {
    const existingDonations = localStorage.getItem('donations');
    if (!existingDonations || JSON.parse(existingDonations).length === 0) {
      localStorage.setItem('donations', JSON.stringify(demoDonations));
      console.log('Demo data populated successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error populating demo data:', error);
    return false;
  }
};

// Function to clear demo data
export const clearDemoData = () => {
  try {
    localStorage.removeItem('donations');
    console.log('Demo data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing demo data:', error);
    return false;
  }
};

// Function to get demo statistics
export const getDemoStats = () => {
  const totalDonations = demoDonations.length;
  const totalAmount = demoDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
  
  const categoryStats = demoDonations.reduce((acc, donation) => {
    acc[donation.category] = (acc[donation.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const regionStats = demoDonations.reduce((acc, donation) => {
    acc[donation.region] = (acc[donation.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalDonations,
    totalAmount: totalAmount.toFixed(2),
    categoryStats,
    regionStats
  };
}; 