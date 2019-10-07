import Web3 from "web3";
import createLedgerSubprovider from "@ledgerhq/web3-subprovider";
import TransportU2F from "@ledgerhq/hw-transport-u2f";
import ProviderEngine from "web3-provider-engine";
import RpcSubprovider from "web3-provider-engine/subproviders/rpc";

const contract_address = "0x654b54c945d29981d597fc8756cdb3c6e372440c";
const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "previousOwner",
        type: "address"
      }
    ],
    name: "OwnershipRenounced",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    constant: false,
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_maxLength",
        type: "uint256"
      }
    ],
    name: "setMaxLength",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_message",
        type: "string"
      }
    ],
    name: "setMessage",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    constant: true,
    inputs: [],
    name: "maxLength",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "message",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];

let my_web3;
let account;
const rpcUrl = "https://ropsten.infura.io";
let contract;
window.addEventListener("load", () => {
  const use_ledger = location.search.indexOf("ledger=true") >= 0;

  if (use_ledger) {
    const engine = new ProviderEngine();
    const getTransport = () => TransportU2F.create();
    const ledger = createLedgerSubprovider(getTransport, {
      networkId: 3 // 3 == Ropsten testnet
    });
    engine.addProvider(ledger);
    engine.addProvider(new RpcSubprovider({ rpcUrl }));
    engine.start();
    my_web3 = new Web3(engine);
  } else if (typeof web3 === "undefined") {
    my_web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  } else {
    my_web3 = new Web3(web3.currentProvider);
  }
  contract = new my_web3.eth.Contract(abi, contract_address);
  my_web3.eth
    .getAccounts((error, result) => {
      if (error) {
        console.log(error);
      } else if (result.length == 0) {
        console.log("You are not logged in");
      } else {
        account = result[0];
        contract.options.from = account;
      }
    })
    .catch(error => {
      console.log("Error: " + error);
    });
  contract.methods
    .message()
    .call((error, result) => {
      if (error) {
        return console.log(error);
      }
      $("#message").text(result);
    })
    .catch(error => {
      console.log("Error: " + error);
    });

  $("#set_message").click(setMessage);
});

function setMessage() {
  let message = $("#new_message").val();
  contract.methods
    .setMessage(message)
    .send({ gasPrice: my_web3.utils.toWei("4.1", "Gwei") }, (error, result) => {
      if (error) {
        return console.log(error);
      }
      console.log("txhash: " + result);
    })
    .catch(error => {
      console.log("Error: " + error);
    });
}
