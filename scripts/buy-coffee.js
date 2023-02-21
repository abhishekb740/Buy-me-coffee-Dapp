// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

async function printBalance(addresses) {
  let index = 0;
  for (const address of addresses) {
    console.log(`Address ${index} balance: `, await getBalance(address));
    index++;
  }
}

async function printMemos(memos) {
  for (const memo of memos) {
    const timeStamp = memo.timestamp;
    const name = memo.name;
    const address = memo.from;
    const message = memo.message;
    console.log(`At ${timeStamp}, ${name}, ${address}, said: "${message}" `);
  }
}

async function main() {
  // Get Example Accounts.
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // Get the Contract and deploy.
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();
  await buyMeACoffee.deployed();
  console.log(
    `BuyMeACoffee Contract Deployed at Address: ${buyMeACoffee.address}`
  )

  // Check Balances before Coffee Purchase.
  const addresses = [owner.address, tipper.address, buyMeACoffee.address];
  console.log("Balance of owner, tipper and contract address before buying Coffee: ");
  await printBalance(addresses);

  // Buy the owner a few coffees.
  const tip = {
    value: hre.ethers.utils.parseEther("1")
  };
  await buyMeACoffee.connect(tipper).buyCoffee("Abhishek","Here's a coffee from me.", tip);
  await buyMeACoffee.connect(tipper2).buyCoffee("Kushal","Amazing Teacher :)", tip);
  await buyMeACoffee.connect(tipper3).buyCoffee("Rugved","I love Blockchain.", tip);

  // Check Balances after the Coffee Purchase.
  console.log("Bought Coffee");
  await printBalance(addresses);

  // Withdraw Funds
  await buyMeACoffee.connect(owner).withdrawTips()

  // Check Balance after withdrawing tips
  console.log("Withdraw Tips");
  await printBalance(addresses);

  // Read all the memos left for the owner.
  console.log("Memos");
  const memos = await buyMeACoffee.getMemos(); 
  printMemos(memos)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
