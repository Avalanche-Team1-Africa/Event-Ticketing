// global.d.ts
export {}; // Ensure this file is treated as a module

import { Eip1193Provider } from "ethers"; // Import Eip1193Provider from ethers

// Extend the Eip1193Provider to add the `on` and `removeListener` methods
declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void; // Adding `on` method
      removeListener: (event: string, callback: (...args: any[]) => void) => void; // Adding `removeListener` method
    };
  }
}
