require('dotenv').config(); 

module.exports = {
    solidity: "0.8.0",  
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
            accounts: [
                process.env.PRIVATE_KEY_1,  // Hämtar privat nyckel från .env
                process.env.PRIVATE_KEY_2   // Hämtar privat nyckel från .env
            ],
        },
    },
    deployments: {
        localhost: {
            deploy: "./scripts/deploy.js",  
        },
    },
};
