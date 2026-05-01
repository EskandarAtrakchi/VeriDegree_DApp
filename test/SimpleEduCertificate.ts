import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleEduCertificate } from "../typechain-types";

describe("SimpleEduCertificate", function () {
  let contract: SimpleEduCertificate;
  let owner: any;
  let student: any;
  let other: any;

  beforeEach(async () => {
    [owner, student, other] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("SimpleEduCertificate");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", () => {
    it("should set correct owner", async () => {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("should have correct name and symbol", async () => {
      expect(await contract.name()).to.equal("SimpleEduCertificate");
      expect(await contract.symbol()).to.equal("SEDU");
    });
  });

  describe("Issue Certificate", () => {
    it("should mint a certificate NFT", async () => {
      const tx = await contract.issueCertificate(
        student.address,
        "ipfs://test-uri",
        "NCI",
        "Eskandar",
        "BSc Computing",
        "2026-06-01"
      );

      const receipt = await tx.wait();

      // tokenId should be 0
      const tokenId = 0;

      expect(await contract.ownerOf(tokenId)).to.equal(student.address);
      expect(await contract.tokenURI(tokenId)).to.equal("ipfs://test-uri");
    });

    it("should store certificate data correctly", async () => {
      await contract.issueCertificate(
        student.address,
        "ipfs://meta",
        "NCI",
        "Eskandar",
        "BSc Computing",
        "2026-06-01"
      );

      const cert = await contract.certificates(0);

      expect(cert.institutionName).to.equal("NCI");
      expect(cert.studentName).to.equal("Eskandar");
      expect(cert.degreeName).to.equal("BSc Computing");
      expect(cert.graduationDate).to.equal("2026-06-01");
      expect(cert.metadataURI).to.equal("ipfs://meta");
      expect(cert.issuedAt).to.not.equal(0);
    });

    it("should only allow owner to issue certificate", async () => {
      await expect(
        contract.connect(other).issueCertificate(
          student.address,
          "ipfs://test",
          "NCI",
          "Eskandar",
          "BSc",
          "2026"
        )
      ).to.be.revertedWith("Not contract owner");
    });

    it("should reject zero address student", async () => {
      await expect(
        contract.issueCertificate(
          ethers.ZeroAddress,
          "ipfs://test",
          "NCI",
          "Eskandar",
          "BSc",
          "2026"
        )
      ).to.be.revertedWith("Invalid student address");
    });
  });

  describe("Soulbound Behavior", () => {
    it("should prevent transfers", async () => {
      await contract.issueCertificate(
        student.address,
        "ipfs://test",
        "NCI",
        "Eskandar",
        "BSc",
        "2026"
      );

      await expect(
        contract
          .connect(student)
          .transferFrom(student.address, other.address, 0)
      ).to.be.revertedWith("Soulbound: non-transferable");
    });

    it("should allow burning (transfer to zero)", async () => {
      await contract.issueCertificate(
        student.address,
        "ipfs://test",
        "NCI",
        "Eskandar",
        "BSc",
        "2026"
      );

      await contract.connect(student).transferFrom(
        student.address,
        ethers.ZeroAddress,
        0
      );

      await expect(contract.ownerOf(0)).to.be.reverted;
    });
  });
});
