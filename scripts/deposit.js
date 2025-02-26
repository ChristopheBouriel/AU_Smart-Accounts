const hre = require("hardhat");

const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0x0C071d7534Ad172e849473607C335c768199Ec37";

async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  await entryPoint.depositTo(PM_ADDRESS, {
    value: hre.ethers.parseEther(".1")
  });

  console.log("Deposit successful !");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
