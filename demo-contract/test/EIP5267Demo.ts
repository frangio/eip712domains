import hre from "hardhat";
import * as viem from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("EIP5267Demo", function () {
  async function setup() {
    const [signer, other] = await hre.viem.getWalletClients();

    const demo = await hre.viem.deployContract("EIP5267Demo");

    return { demo, signer, other };
  }

  it("should accept signature", async function () {
    const { demo, signer } = await loadFixture(setup);

    const domainDescriptor = await demo.read.eip712Domain();
    const domain = buildDomain(...domainDescriptor);

    const value = 42n;

    const signature = await signer.signTypedData({
      domain,
      primaryType: 'Value',
      types: { Value: [{ name: 'value', type: 'uint256' }] },
      message: { value },
    });
    const { r, yParityAndS: vs } = viem.hexToCompactSignature(signature);

    await demo.read.checkSignature([signer.account.address, value, r, vs]);
  });
});

const fieldNames = ['name', 'version', 'chainId', 'verifyingContract', 'salt'] as const;

/** Builds a domain object based on the values obtained by calling `eip712Domain()` in a contract. */
function buildDomain(
  fieldsString: viem.Hex,
  name: string,
  version: string,
  chainId: bigint,
  verifyingContract: viem.Hex,
  salt: viem.Hex,
  extensions: readonly unknown[],
) {
  if (extensions.length > 0) {
    throw Error("extensions not implemented");
  }

  const fields = Number(fieldsString);
  const domain = { name, version, chainId: Number(chainId), verifyingContract, salt };

  for (const [i, field] of fieldNames.entries()) {
    if (!(fields & (1 << i))) {
      delete domain[field];
    }
  }

  return domain;
}
