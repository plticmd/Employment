import { Client, Wallet, dropsToXrp, isValidClassicAddress, xrpToDrops } from 'xrpl';

import getWalletDetails from './src/helpers/get-wallet-details';

import submitTransaction from './src/helpers/submit-transaction';

const { Xumm } = require('xumm');
//const { convertStringToHex, NFTokenMintFlags } = require('xrpl');

const xumm = new Xumm('api-key', 'api-secret');
const transaction = {
  TransactionType: 'EscrowCreate',
  TransferFee: 10 * 1000, // 10%
  // Sequence: '',
  //AccountTxnID: Hash256,
  Amount: 'Amount',
  Destination: 'AccountID',
  Condition: 'Blob',
  FInishAfter: 'Uint32',
  CancelAfter: 'Uint32',
  DestinationTag: 'Uint32',


  //URI: convertStringToHex('ipfs://***'),
};
xumm.payload?.create(transaction).then(payload=>{
  console.log(payload);
});

// Get the elements from the DOM
const destinationAddress = document.querySelector('#destination_address');
const amount = document.querySelector('#amount');
const destinationTag = document.querySelector('#destination_tag');
const submitTxBtn = document.querySelector('#submit_tx_button');
const availableBalanceElement = document.querySelector('#available_balance');
const condition = document.querySelector('#condition');
const finishAfter = document.querySelector('#finish_after');
const cancelAfter = document.querySelector('#cancel_after');


// Disable the submit button by default
submitTxBtn.disabled = true;
let isValidDestinationAddress = false;
const allInputs = document.querySelectorAll('#destination_address, #amount');

// Update the account balance on successful transaction
client.on('transaction', (response) => {
  if (response.validated && response.transaction.TransactionType === 'Payment') {
      getWalletDetails({ client }).then(({ accountReserves, account_data }) => {
          availableBalanceElement.textContent = `Available Balance: ${dropsToXrp(account_data.Balance) - accountReserves} XRP`;
      });
  }
});

const validateAddress = () => {
  destinationAddress.value = destinationAddress.value.trim();
  // Check if the address is valid
  if (isValidClassicAddress(destinationAddress.value)) {
      // Remove the invalid class if the address is valid
      destinationAddress.classList.remove('invalid');
      isValidDestinationAddress = true;
  } else {
      // Add the invalid class if the address is invalid
      isValidDestinationAddress = false;
      destinationAddress.classList.add('invalid');
  }
};

// Add event listener to the destination address
destinationAddress.addEventListener('input', validateAddress);

// Add event listener to the amount input
amount.addEventListener('keydown', (event) => {
  const codes = [8, 190];
  const regex = /^[0-9\b.]+$/;

  // Allow: backspace, delete, tab, escape, enter and .
  if (!(regex.test(event.key) || codes.includes(event.keyCode))) {
      event.preventDefault();
      return false;
  }

  return true;
});



// NOTE: Keep this code at the bottom of the other input event listeners
// All the inputs should have a value to enable the submit button
for (let i = 0; i < allInputs.length; i++) {
  allInputs[i].addEventListener('input', () => {
      let values = [];
      allInputs.forEach((v) => values.push(v.value));
      submitTxBtn.disabled = !isValidDestinationAddress || values.includes('');
  });
}


// Add event listener to the submit button
submitTxBtn.addEventListener('click', async () => {
  try {
      console.log('Submitting transaction');
      submitTxBtn.disabled = true;
      submitTxBtn.textContent = 'Submitting...';

      // Create the transaction object: https://xrpl.org/transaction-common-fields.html
      const txJson = {
          TransactionType: 'Payment',
          Amount: xrpToDrops(amount.value), // Convert XRP to drops: https://xrpl.org/basic-data-types.html#specifying-currency-amounts
          Destination: destinationAddress.value,
      };

      // Get the destination tag if it exists
      if (destinationTag?.value !== '') {
          txJson.DestinationTag = destinationTag.value;
      }

      // Submit the transaction to the ledger
      const { result } = await submitTransaction({ client, tx: txJson });
      const txResult = result?.meta?.TransactionResult || result?.engine_result || ''; // Response format: https://xrpl.org/transaction-results.html

      // Check if the transaction was successful or not and show the appropriate message to the user
      if (txResult === 'tesSUCCESS') {
          alert('Transaction submitted successfully!');
      } else {
          throw new Error(txResult);
      }
  } catch (error) {
      alert('Error submitting transaction, Please try again.');
      console.error(error);
  } finally {
      // Re-enable the submit button after the transaction is submitted so the user can submit another transaction
      submitTxBtn.disabled = false;
      submitTxBtn.textContent = 'Submit Transaction';
  }
});


