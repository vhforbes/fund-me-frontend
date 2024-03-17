'use client';

import { Contract } from 'ethers';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import fundMeAbi from '../abis/fundMe.abi.json';

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider>(); // Makes read only txs
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>(); // Makes writes txs
  const [address, setAddress] = useState<string>();
  const [contract, setContract] = useState<Contract>();

  const [currentAmountFunded, setCurrentAmmountFunded] = useState<string>();
  const [ammount, setAmmount] = useState<string>();

  const contractAddress = '0xaA29d2A90c8BE8b7c5c8a1301bC86156332F5070';

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);

        const signerToSet = await newProvider.getSigner();
        setSigner(signerToSet);
      } catch (error) {
        console.error('Error connecting to MetaMask', error);
      }
    } else {
      console.log('MetaMask not installed; using read-only defaults');
    }
  };

  const getAddress = async () => {
    if (signer) {
      setAddress(await signer.getAddress());
    }
  };

  const fundFundMe = async () => {
    if (ammount && contract) {
      const tx = {
        value: ethers.parseEther(ammount), // Converts 0.1 ETH to Wei
      };

      try {
        const txResponse = await contract.fund(tx);
        const receipt = await txResponse.wait();

        console.log(receipt);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const withdrawAllFunds = async () => {
    if (contract) {
      const txResponse = await contract.withdraw();
      const receipt = await txResponse.wait();

      console.log(receipt);
    }
  };

  const getCurrentAmmountFunded = async () => {
    const response = await provider?.getBalance(contractAddress);

    if (response)
      setCurrentAmmountFunded(ethers.formatUnits(response?.toString()));
  };

  useEffect(() => {
    getAddress();
    setContract(new Contract(contractAddress, fundMeAbi, signer));
  }, [signer]);

  useEffect(() => {
    getCurrentAmmountFunded();
    setContract(new Contract(contractAddress, fundMeAbi, provider));
  }, [provider]);

  return (
    <main>
      <div>
        {!signer ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <p>Wallet Connected: {address}</p>
        )}
      </div>
      <div className="flex flex-col p-10">
        <h1 className="text-2xl">Fund Me</h1>
        <p>Current ammount funded is: {currentAmountFunded}</p>
        <br />
        <div>
          <input
            type="number"
            onChange={(e) => setAmmount(e.target.value)}
            className="text-black"
          ></input>
          <button
            onClick={fundFundMe}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
          >
            FUND
          </button>
        </div>
        <button
          className="mt-10 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
          onClick={withdrawAllFunds}
        >
          Withdraw
        </button>
      </div>
    </main>
  );
}
