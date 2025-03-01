import React, { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Wallet, Loader2, AlertCircle, Tag, ShoppingCart } from "lucide-react"


const CONTRACT_ADDRESS = "0x256ff3b9d3df415a05ba42beb5f186c28e103b2a"
const CONTRACT_ABI = [
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function listTicketForSale(uint256 tokenId, uint256 price) public",
  "function buyResaleTicket(uint256 tokenId) public payable",
  "function cancelResaleListing(uint256 tokenId) public",
  "function getTicketDetails(uint256 tokenId) public view returns (address owner, bool isForSale, uint256 price)",
]

const QuantumTicketResale = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userTickets, setUserTickets] = useState<any[]>([])
  const [resaleListings, setResaleListings] = useState<any[]>([])
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [resalePrice, setResalePrice] = useState("")
  const [activeTab, setActiveTab] = useState("resell")

  useEffect(() => {
    setIsVisible(true)
    checkWalletConnection()
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", () => window.location.reload())
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  useEffect(() => {
    if (isWalletConnected) {
      updateUserTickets()
      updateResaleListings()
    }
  }, [isWalletConnected])

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsWalletConnected(false)
      setWalletAddress("")
    } else {
      setWalletAddress(accounts[0])
    }
  }

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsWalletConnected(true)
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("Please install MetaMask to connect your wallet!")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsWalletConnected(true)
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      setError("Failed to connect wallet. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserTickets = async () => {
    if (!isWalletConnected) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

      const balance = await contract.balanceOf(walletAddress)
      const tickets = []

      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i)
        const details = await contract.getTicketDetails(tokenId)
        tickets.push({
          tokenId: tokenId.toString(),
          owner: details.owner,
          isForSale: details.isForSale,
          price: details.price,
        })
      }

      setUserTickets(tickets)
    } catch (error) {
      console.error("Error fetching user tickets:", error)
    }
  }

  const updateResaleListings = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

      const totalSupply = await contract.totalSupply()
      const listings = []

      for (let i = 0; i < totalSupply; i++) {
        const details = await contract.getTicketDetails(i)
        if (details.isForSale) {
          listings.push({
            tokenId: i.toString(),
            owner: details.owner,
            isForSale: details.isForSale,
            price: details.price,
          })
        }
      }

      setResaleListings(listings)
    } catch (error) {
      console.error("Error fetching resale listings:", error)
    }
  }

  const handleListForResale = async () => {
    if (!selectedTicket || !resalePrice) return

    try {
      setIsLoading(true)
      setError(null)

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      const priceInWei = ethers.parseEther(resalePrice)
      const tx = await contract.listTicketForSale(selectedTicket.tokenId, priceInWei)
      await tx.wait()

      await updateUserTickets()
      await updateResaleListings()

      alert("Ticket listed for resale successfully!")
    } catch (error: any) {
      console.error("Error listing ticket for resale:", error)
      setError(error.message || "Failed to list ticket for resale. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyResaleTicket = async (tokenId: string, price: ethers.BigNumberish) => {
    try {
      setIsLoading(true)
      setError(null)

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      const tx = await contract.buyResaleTicket(tokenId, { value: price })
      await tx.wait()

      await updateUserTickets()
      await updateResaleListings()

      alert("Resale ticket purchased successfully!")
    } catch (error: any) {
      console.error("Error buying resale ticket:", error)
      setError(error.message || "Failed to buy resale ticket. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 300}px`,
              height: `${Math.random() * 300}px`,
              background: "radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(0,0,0,0) 70%)",
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <main className="relative pt-10 sm:pt-20 px-4 sm:px-6">
        <div className="absolute top-4 right-4">
          {!isWalletConnected ? (
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 
                hover:from-purple-500 hover:to-blue-500 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
              <span>{isLoading ? "Connecting..." : "Connect"}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 rounded-lg p-2">
              <Wallet className="w-4 h-4 text-purple-400" />
              <span className="text-sm">{formatAddress(walletAddress)}</span>
              <button
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => setIsWalletConnected(false)}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 
              ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"}`}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Quantum Realm of Ticket Collection
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4 sm:px-0">
              Enter the quantum realm with an exclusive ticket to our unique experience. Each ticket grants you access
              to a one-of-a-kind event, digitally stored and verified on the blockchain.
            </p>
          </div>

          <div className="flex justify-center mb-8 flex-wrap">
            <fieldset className="inline-flex rounded-md shadow-sm flex-wrap justify-center">
              <button
                type="button"
                onClick={() => setActiveTab("resell")}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  activeTab === "resell"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                Resell Your Ticket
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("buy")}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  activeTab === "buy"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                Buy Resale Ticket
              </button>
            </fieldset>
          </div>

          {activeTab === "resell" && (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8">
              <h2 className="text-2xl font-bold mb-4">Resell Your Ticket</h2>
              <p className="text-gray-400 mb-6">List your ticket for resale on the marketplace</p>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userTickets.map((ticket) => (
                    <button
                      key={ticket.tokenId}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`px-4 py-2 rounded-lg ${
                        selectedTicket?.tokenId === ticket.tokenId
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      Ticket #{ticket.tokenId}
                    </button>
                  ))}
                </div>
                {selectedTicket && (
                  <div className="grid gap-2">
                    <label htmlFor="resalePrice" className="text-sm text-gray-400">
                      Resale Price (AVAX)
                    </label>
                    <input
                      id="resalePrice"
                      type="number"
                      placeholder="Enter resale price"
                      value={resalePrice}
                      onChange={(e) => setResalePrice(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={handleListForResale}
                disabled={!selectedTicket || !resalePrice || isLoading}
                className={`mt-6 w-full px-6 py-3 rounded-xl ${
                  !selectedTicket || !resalePrice || isLoading
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                } transition-colors duration-300`}
              >
                {isLoading ? (
                  <Loader2 className="inline-block w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Tag className="inline-block w-5 h-5 mr-2" />
                )}
                List for Resale
              </button>
            </div>
          )}

          {activeTab === "buy" && (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8">
              <h2 className="text-2xl font-bold mb-4">Buy Resale Tickets</h2>
              <p className="text-gray-400 mb-6">Purchase tickets listed for resale by other users</p>
              <div className="grid gap-4">
                {resaleListings.map((listing) => (
                  <div
                    key={listing.tokenId}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-700 rounded-lg"
                  >
                    <div>
                      <h3 className="text-lg font-semibold">Ticket #{listing.tokenId}</h3>
                      <p className="text-sm text-gray-400">Price: {ethers.formatEther(listing.price)} AVAX</p>
                    </div>
                    <button
                      onClick={() => handleBuyResaleTicket(listing.tokenId, listing.price)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-300 mt-2 sm:mt-0 w-full sm:w-auto"
                    >
                      <ShoppingCart className="inline-block w-5 h-5 mr-2" />
                      Buy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-red-500 text-center">
              <AlertCircle className="w-6 h-6 inline-block mr-2" />
              <span className="align-middle">{error}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default QuantumTicketResale

