const hre = require("hardhat");

const ACCOUNT_ADDRESS = "0x75537828f2ce51be7289709686A69CbFDbB714F1"; // got by the console.log() at the second run of execute.js

async function main() {
  const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDRESS)
  const count = await account.count();

  console.log(count);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
