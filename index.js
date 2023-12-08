import { Client, dropsToXrp, rippleTimeToISOTime } from 'xrpl';

import getWalletDetails from './src/helpers/get-wallet-details.js';

const client = new Client(process.env.CLIENT); // Get the client from the environment variables

// Get the elements from the DOM
const walletElement = document.querySelector('#wallet');
const walletLoadingDiv = document.querySelector('#loading_wallet_details');
//const ledgerLoadingDiv = document.querySelector('#loading_ledger_details');

// Self-invoking function to connect to the client
(async () => {
    try {
        await client.connect(); // Connect to the client

        // Subscribe to the ledger stream
        await client.request({
            command: 'subscribe',
            streams: ['ledger'],
        });

        // Fetch the wallet details
        getWalletDetails({ client })
            .then(({ account_data, accountReserves, xAddress, address }) => {
                walletElement.querySelector('.wallet_address').textContent = `Wallet Address: ${account_data.Account}`;
                walletElement.querySelector('.wallet_balance').textContent = `Wallet Balance: ${dropsToXrp(account_data.Balance)} XRP`;
                walletElement.querySelector('.wallet_reserve').textContent = `Wallet Reserve: ${accountReserves} XRP`;
                walletElement.querySelector('.wallet_xaddress').textContent = `X-Address: ${xAddress}`;

                // Redirect on View More link click
                walletElement.querySelector('#escrow_button').addEventListener('click', () => {
                    window.open(`/src/escrow/escrow.html`);
                });
                
                walletElement.querySelector('#view_more_button').addEventListener('click', () => {
                    window.open(`https://${process.env.EXPLORER_NETWORK}.xrpl.org/accounts/${address}`, '_blank');
                });
            })
            .finally(() => {
                walletLoadingDiv.style.display = 'none';
            });
        
    } catch (error) {
        await client.disconnect();
        console.log(error);
    }
})();
