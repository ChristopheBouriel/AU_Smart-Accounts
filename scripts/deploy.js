const hre = require("hardhat");

async function main() {
  const af = await hre.ethers.deployContract("AccountFactory");

  await af.waitForDeployment();

  console.log(
    `AF Deployed to ${af.target}`
  );

  const ep = await hre.ethers.deployContract("EntryPoint");

  await ep.waitForDeployment();

  console.log(
    `EP Deployed to ${ep.target}`
  );

  const pm = await hre.ethers.deployContract("Paymaster");

  await pm.waitForDeployment();

  console.log(
    `PM Deployed to ${pm.target}`
  );
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
