import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress }  from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = balance;
withdrawButton.onclick = withdraw;

async function connect() {
    if(window.ethereum.isMetaMask) {
        await window.ethereum.request({method: "eth_requestAccounts"});
        document.getElementById("connectInfo").innerHTML = "Connected";
    } else {
        document.getElementById("connectInfo").innerHTML = "You need to install Metamask";
    }
}

async function fund() {
    const ethAmount = ethers.utils.parseEther(document.getElementById("ethAmount").value);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
        const txResponse = await contract.fund({value: ethAmount});
        console.log(await listenForTransactionMine(txResponse, provider));
    }
    catch(error) {
        console.log(error);
    }
}

async function balance() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const userAddress = await signer.getAddress();
    const fundedAmount = await contract.s_addressToAmountFunded(userAddress);
    document.getElementById("balanceInfo").innerHTML = `You funded: ${fundedAmount}`
}

async function withdraw() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
        const txResponse = await contract.withdraw();
        await listenForTransactionMine(txResponse, provider);
        document.getElementById("withdrawInfo").innerHTML = "Withdraw done!";
    } catch(error) {
        console.log(error);
    }

}

function listenForTransactionMine(txResponse, provider) {
    console.log(`Mining ${txResponse.hash}...`);
    
    return new Promise((resolve, reject) => {
        provider.once(txResponse.hash, (txReceipt) => {
            console.log(`Completed with ${txReceipt.confirmations} Confirmations`);
            document.getElementById("fundInfo").innerHTML = "Funding Done!";
            resolve("Done");
        });
    });
}