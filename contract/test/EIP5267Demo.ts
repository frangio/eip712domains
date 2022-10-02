import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import type { BigNumber } from "ethers";

describe("EIP5267Demo", function () {
  async function setup() {
    // Contracts are deployed using the first signer/account by default
    const [signer, other] = await ethers.getSigners();

    const EIP5267Demo = await ethers.getContractFactory("EIP5267Demo");
    const demo = await EIP5267Demo.deploy();

    return { demo, signer, other };
  }

  it("should accept signature", async function () {
    const { demo, signer } = await loadFixture(setup);

    const domainDescriptor: Parameters<typeof buildDomain> = await demo.eip712Domain();
    const domain = buildDomain(...domainDescriptor);

    const value = 42n;

    const signature = await signer._signTypedData(
      domain,
      { Value: [{ name: 'value', type: 'uint256' }] },
      { value },
    );
    const { r, yParityAndS: vs } = ethers.utils.splitSignature(signature);

    await demo.checkSignature(signer.address, value, r, vs);
  });
});

const fieldNames = ['name', 'version', 'chainId', 'verifyingContract', 'salt'] as const;

/** Builds a domain object based on the values obtained by calling `eip712Domain()` in a contract. */
function buildDomain(
  fieldsString: string,
  name: string,
  version: string,
  chainId: BigNumber,
  verifyingContract: string,
  salt: string,
  extensions: unknown[],
) {
  if (extensions.length > 0) {
    throw Error("extensions not implemented");
  }

  const fields = Number(fieldsString);
  const domain = { name, version, chainId, verifyingContract, salt };

  for (const [i, field] of fieldNames.entries()) {
    if (!(fields & (1 << i))) {
      delete domain[field];
    }
  }

  return domain;
}
