## This is explanation of the smart contract 

1. Lets (the deployer) act as the ONLY issuer of certificates. No one else can mint or issue certificates except your wallet.
2. Creates a unique NFT for each certificate. Every certificate has its own token ID.
3. Mints the certificate NFT directly to the student’s Web3 wallet. The student receives the NFT as proof of completion.
4. Stores important certificate details ON-CHAIN, including:
Institution name
Student name
Degree/certificate name
Graduation date
IPFS metadata URI
Date of issue (timestamp)
5. Stores an IPFS URI for the NFT metadata. This links to an image + JSON on IPFS showing the certificate.
6. Makes the NFT “soulbound” (non-transferable). Students cannot transfer it to someone else. It stays permanently in the wallet it was issued to.
7. Allows verifiers (employers, companies, etc..) to verify the degree easily by checking:
NFT ownership ownerOf(tokenId)
Certificate data certificates(tokenId)
IPFS metadata tokenURI(tokenId)
Ensures certificates cannot be faked or altered, since all data is stored on the blockchain and only you can create them.