const hre = require("hardhat");

// const FACTORY_NONCE = 1;
const FACTORY_ADDRESS = "0xeC99d1513A6419Aa26F506dcfac98F6B913b9A26";
// For the last step we don't need to deploy the entryPoint on the testnet because we will use a supported one
// https://docs.alchemy.com/reference/eth-estimateuseroperationgas
// const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
const PM_ADDRESS = "0x0C071d7534Ad172e849473607C335c768199Ec37";

async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  // CREATE: hash(sender + nonce) --> standard way for creating the smart contract (aka address)
  // That's what we do in a first place to stay simple and go ahead until it's time to use a bundler
  // CREATE2: hash(0xFF + sender + bytecode + salt) --> new way, but already a standard, to create a smart contract
  // That's what we must do when it's time to use a bundler (because CREATE is a forbidden opCode,
  // not deterministic enough for the simulation because of the nonce that could change)
  // See doc for ERC-4337 at eips.ethereum.org/EIPS/eip-4337
  /* const sender = await hre.ethers.getCreateAddress({
    from: FACTORY_ADDRESS,
    nonce: FACTORY_NONCE,
  }); */

  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
  const [signer0, signer1] = await hre.ethers.getSigners();
  const address0 = await signer0.getAddress();

  // For the first run only, after we don't want to because the smart account has already been deployed
  // Thus we don't need to create a sender again, and it won't be done if the initcode == 0
  let initCode = FACTORY_ADDRESS + AccountFactory.interface.encodeFunctionData("createAccount", [address0]).slice(2);
  // const initCode = "0x";

  // It's a bit weird but the method doesn't return anything and revert, so we need to catch the error 
  // in order to be able to get the sender address
  let sender;
  try {
    await entryPoint.getSenderAddress(initCode);
  }
  catch(err) {
    sender = "0x" + err.data.slice(-40);
  }

  const code = await ethers.provider.getCode(sender);
  if(code !== "0x") {
    initCode = "0x";
  }
  
  console.log({sender}); // We'll need it for test

  const Account = await hre.ethers.getContractFactory("Account");
  const userOp = {
    sender, // smart contract address
    nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16), // because getNonce will return a bigNumber
    initCode,
    callData: Account.interface.encodeFunctionData("execute"),
    paymasterAndData: PM_ADDRESS,
    signature: "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
  };

  const {preVerificationGas, verificationGasLimit, callGasLimit} = await hre.ethers.provider.send("eth_estimateUserOperationGas", [ 
    userOp,
    EP_ADDRESS,
  ]);

  userOp.preVerificationGas = preVerificationGas;
  userOp.verificationGasLimit = verificationGasLimit;
  userOp.callGasLimit = callGasLimit;

  const {maxFeePerGas} = await hre.ethers.provider.getFeeData();
  userOp.maxFeePerGas = "0x" + maxFeePerGas.toString(16);

  const maxPriorityFeePerGas = await hre.ethers.provider.send("rundler_maxPriorityFeePerGas");
  userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

  const userOpHash = await entryPoint.getUserOpHash(userOp);
  userOp.signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash));
  // userOp.signature = signer1.signMessage(hre.ethers.getBytes(userOpHash)); cannot work signer1 doesn't match userOphash
  
  const opHash = await ethers.provider.send("eth_sendUserOperation", [userOp, EP_ADDRESS]);

  console.log(opHash);

  setTimeout(async () => {
    const { transactionHash } = await ethers.provider.send("eth_getUserOperationByHash", [opHash]);

    console.log(transactionHash);
  }, 30000);
 
  /*const tx = await entryPoint.handleOps([userOp], address0);
  const receipt = await tx.wait();
  console.log(receipt);*/
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
