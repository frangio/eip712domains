import hre, { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const EIP5267Demo = await ethers.getContractFactory("EIP5267Demo");

  const maxFeePerGas = ethers.utils.parseUnits('12', 'gwei');
  const maxPriorityFeePerGas = ethers.utils.parseUnits('1', 'gwei');

  const demo = await EIP5267Demo.deploy({ maxFeePerGas, maxPriorityFeePerGas });

  await demo.deployed();

  if (hre.network.name === 'ethereum') {
    await hre.run('verify:verify', { address: demo.address });
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
