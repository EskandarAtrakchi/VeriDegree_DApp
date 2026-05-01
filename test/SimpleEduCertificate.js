const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleEduCertificate", function () {
  let contract;
  let owner, student, student2;

  beforeEach(async function () {
    [owner, student, student2] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("SimpleEduCertificate");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  // 1
  it("should set correct owner on deployment", async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });

  // 2
  it("should issue a certificate successfully", async function () {
    await contract.issueCertificate(
      student.address,
      "ipfs://cert-1",
      "NCI",
      "Eskandar",
      "BSc Computing",
      "2026-06-01"
    );

    const cert = await contract.certificates(1);

    expect(cert.studentName).to.equal("Eskandar");
    expect(cert.degreeName).to.equal("BSc Computing");
  });

  // 3
  it("should mint NFT to correct student", async function () {
    await contract.issueCertificate(
      student.address,
      "ipfs://cert-1",
      "NCI",
      "Eskandar",
      "BSc Computing",
      "2026-06-01"
    );

    expect(await contract.ownerOf(1)).to.equal(student.address);
  });

  // 4
  it("should increment token IDs correctly", async function () {
    await contract.issueCertificate(student.address, "ipfs://1", "NCI", "A", "B", "2026");
    await contract.issueCertificate(student.address, "ipfs://2", "NCI", "B", "C", "2026");

    expect(await contract.ownerOf(1)).to.equal(student.address);
    expect(await contract.ownerOf(2)).to.equal(student.address);
  });

  // 5
  it("should prevent non-owner from issuing certificate", async function () {
    await expect(
      contract.connect(student).issueCertificate(
        student.address,
        "ipfs://hack",
        "NCI",
        "Hacker",
        "BSc",
        "2026"
      )
    ).to.be.revertedWith("Not owner");
  });

  // 6
  it("should reject invalid student address", async function () {
    await expect(
      contract.issueCertificate(
        ethers.ZeroAddress,
        "ipfs://cert",
        "NCI",
        "Test",
        "BSc",
        "2026"
      )
    ).to.be.revertedWith("Invalid student");
  });

  // 7
  it("should store metadata URI correctly", async function () {
    await contract.issueCertificate(
      student.address,
      "ipfs://metadata-123",
      "NCI",
      "Eskandar",
      "BSc Computing",
      "2026-06-01"
    );

    expect(await contract.tokenURI(1)).to.equal("ipfs://metadata-123");
  });

  // 8
  it("should prevent token transfers (soulbound behavior)", async function () {
    await contract.issueCertificate(
      student.address,
      "ipfs://cert",
      "NCI",
      "Eskandar",
      "BSc",
      "2026"
    );

    await expect(
      contract
        .connect(student)
        .transferFrom(student.address, student2.address, 1)
    ).to.be.revertedWith("Soulbound: non-transferable");
  });

  // 9
  it("should allow multiple certificates for same student", async function () {
    await contract.issueCertificate(student.address, "ipfs://1", "NCI", "A", "B", "2026");
    await contract.issueCertificate(student.address, "ipfs://2", "NCI", "A", "MSc", "2027");

    const cert2 = await contract.certificates(2);

    expect(cert2.degreeName).to.equal("MSc");
  });

  // 10
  it("should store institution name correctly", async function () {
    await contract.issueCertificate(
      student.address,
      "ipfs://cert",
      "National College of Ireland",
      "Eskandar",
      "BSc Computing",
      "2026"
    );

    const cert = await contract.certificates(1);

    expect(cert.institutionName).to.equal("National College of Ireland");
  });
});
