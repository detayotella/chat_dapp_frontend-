import abi from './abi/ChatRegistry.json';

const config = {
  address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Local hardhat deployment address
  abi: abi.abi
};

export const ChatRegistryConfig = Object.freeze(config);