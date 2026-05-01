import { expect } from "chai";
import { network } from "hardhat";

describe("SimpleEduCertificate (viem)", () => {
  let publicClient: any;
  let walletClient: any;
  let accounts: any;
  let contract: any;

  beforeEach(async () => {
    // get clients
    publicClient = await network.connect().then(n => n.viem.getPublicClient());
    walletClient = await network.connect().then(n => n.viem.getWalletClient());

    accounts = await walletClient.getAddresses();

    // deploy contract
    contract = await network.connect().then(n =>
      n.viem.deployContract("SimpleEduCertificate")
    );
  });

  it("should set correct owner", async () => {
    const owner = await contract.read.owner();
    expect(owner).to.equal(accounts[0]);
  });

  it("should mint certificate", async () => {
    await contract.write.issueCertificate([
      accounts[1],
      "ipfs://test",
      "NCI",
      "Eskandar",
      "BSc",
      "2026"
    ]);

    const ownerOf = await contract.read.ownerOf([1n]);
    expect(ownerOf).to.equal(accounts[1]);
  });

  it("should store certificate data", async () => {
    await contract.write.issueCertificate([
      accounts[1],
      "ipfs://meta",
      "NCI",
      "Eskandar",
      "BSc",
      "2026"
    ]);

    const cert = await contract.read.certificates([1n]);

    expect(cert[0]).to.equal("NCI");          // institutionName
    expect(cert[1]).to.equal("Eskandar");     // studentName
    expect(cert[2]).to.equal("BSc");          // degreeName
    expect(cert[3]).to.equal("2026");         // graduationDate
    expect(cert[4]).to.equal("ipfs://meta");  // metadataURI
  });

  it("should prevent non-owner issuing", async () => {
    const client2 = await network.connect().then(n =>
      n.viem.getWalletClient({ account: accounts[2] })
    );

    await expect(
      contract.write.issueCertificate(
        [
          accounts[1],
          "ipfs://test",
          "NCI",
          "Eskandar",
          "BSc",
          "2026"
        ],
        { account: accounts[2] }
      )
    ).to.be.rejected;
  });

  it("should block transfers (soulbound)", async () => {
    await contract.write.issueCertificate([
      accounts[1],
      "ipfs://test",
      "NCI",
      "Eskandar",
      "BSc",
      "2026"
    ]);

    await expect(
      contract.write.transferFrom([
        accounts[1],
        accounts[2],
        1n
      ])
    ).to.be.rejected;
  });
});
