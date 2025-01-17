import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function ConnectWalletButton() {
  const [walletAddress, setWalletAddress] = useState(null)

  // Function to connect the wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access from MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        // Create an ethers provider
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        
        // Get the signer (the connected wallet)
        const signer = provider.getSigner()
        
        // Get the wallet address
        const address = await signer.getAddress()
        
        // Set the wallet address to state
        setWalletAddress(address)
        console.log('Connected wallet address:', address)
      } catch (error) {
        console.error('Error connecting wallet:', error)
        alert('Failed to connect wallet.')
      }
    } else {
      alert('Please install MetaMask or another Ethereum-compatible wallet to connect.')
    }
  }

  // Handle account and network changes
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0])  // Set the first account address
      } else {
        setWalletAddress(null)
      }
    }

    const handleChainChanged = () => {
      window.location.reload()  // Reload to reflect network changes
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    // Cleanup listeners when the component is unmounted
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  return (
    <div className="text-center">
      {/* Connect Wallet Button */}
      <button
        onClick={connectWallet}  // Trigger wallet connection when clicked
        className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
      >
        {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...` : 'Connect Wallet'}
      </button>

      {/* Display the wallet address if connected */}
      {walletAddress && (
        <div className="mt-4 text-lg font-medium text-gray-500">
          Wallet Address: {walletAddress}
        </div>
      )}
    </div>
  )
}
