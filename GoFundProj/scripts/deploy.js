async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Hämta kontrakt
    const Campaign = await ethers.getContractFactory("Crowdfunding");

    try {
        // Vänta på att kontraktet ska deployeras
        const campaign = await Campaign.deploy();
        console.log("Contract deployment transaction:", campaign.deployTransaction);

        // Vänta på att transaktionen ska bekräftas
        await campaign.deployTransaction.wait(); // Vänta på att transaktionen ska bekräftas

        // Skriver ut kontraktets adress
        console.log("Crowdfunding contract deployed to:", campaign.address);
    } catch (error) {
        console.error("Error during contract deployment:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
