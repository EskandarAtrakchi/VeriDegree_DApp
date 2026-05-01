const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleEduCertificate", function () {
  let contract;
  let owner, student;

  beforeEach(async function () {
    [owner, student] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("SimpleEduCertificate");
    contract = await Contract.deploy();
    await contract.deployed();
  });

  it("should issue a certificate", async function () {
    const tx = await contract.issueCertificate(
      student.address,
      "ipfs://test-uri",
      "National College of Ireland",
      "Eskandar Atrakchi",
      "BSc Computing",
      "2026-06-01"
    );

    await tx.wait();

    const cert = await contract.certificates(1);

    expect(cert.studentName).to.equal("Eskandar Atrakchi");
    expect(cert.degreeName).to.equal("BSc Computing");
  });
});
