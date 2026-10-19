import { parseBankSMS, parseBulkSMS } from '../utils/smsParser.js';

const tests = [
  {
    name: 'Axis Bank Real Sample (User)',
    text: 'INR 2000.00 debited from A/c no. XX001664 on ROSHAN TRAD 17-10-2026 22:12:28 IST. Avl bal: INR 5097.94. Not you? SMS BLOCKCARD XX7563 to +919951860002 - Axis Bank'
  },
  {
    name: 'HDFC Bank Real Sample (User)',
    text: 'Credit Alert!\nRs.10.00 credited to HDFC Bank A/c XX5981 on 19-10-26 from VPA *asen@okhdfcbank (UPI 131518795093)'
  },
  {
    name: 'HDFC Bank Debit Sample',
    text: 'Rs. 450.00 debited from HDFC Bank A/c XX5981 on 15-10-26 to SWIGGY. Avl Bal: Rs. 14,250.00. UPI Ref: 42891823910'
  },
  {
    name: 'SBI Bank Debit Sample',
    text: 'Dear SBI User, A/c 1234 debited by 500.00 on 12Oct26 trf to SWIGGY Ref No 2341234. Avl Bal Rs: 23,450.00'
  },
  {
    name: 'SBI Bank Credit Sample',
    text: 'Dear SBI User, A/c 1234 credited by 25000.00 on 01Oct26 by transfer from SALARY. Avl Bal Rs: 48,450.00'
  },
  {
    name: 'ICICI Bank Debit Sample',
    text: 'Dear Customer, Acct XX4567 is debited with INR 899.00 on 12-Oct-26. Info: Amazon Pay. Avl Bal: INR 12,450.00.'
  },
  {
    name: 'KVB Bank Debit Sample',
    text: 'Your a/c XXXXXXXXXXXX1516 is debited for Rs.350.00 on 18-Oct-26 by UPI to SWIGGY. Avl Bal Rs.24,630.00 - KVB'
  }
];

console.log('=== TESTING PARSER ON ALL REAL BANK SAMPLES ===');
for (const t of tests) {
  const res = parseBankSMS(t.text);
  console.log(`\n--- ${t.name} ---`);
  if (!res.success) {
    console.error('FAILED:', res.error);
  } else {
    console.log(res.data);
  }
}

console.log('\n=== TESTING BULK MULTI-BANK IMPORT ===');
const bulk = tests.map(t => t.text).join('\n\n');
const bulkRes = parseBulkSMS(bulk);
console.log('Bulk summary:', bulkRes.summary);
for (const p of bulkRes.parsed) {
  console.log(`✅ [${p.bank_name}] ${p.account_name} | ${p.type.toUpperCase()} ₹${p.amount} | Date: ${p.date} | Note: "${p.note}" | Cat: ${p.category} | Avl Bal: ${p.available_balance}`);
}
