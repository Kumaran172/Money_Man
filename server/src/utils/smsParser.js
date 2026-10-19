/**
 * Universal Indian Bank & UPI SMS Parser Engine (v3)
 * Supports Axis Bank, HDFC Bank, SBI, ICICI Bank, Karur Vysya Bank (KVB),
 * Kotak Mahindra, Canara, PNB, Bank of Baroda, IDFC FIRST, and all major Indian banks.
 * 
 * Accurately extracts:
 * - Transaction type (credit / debit)
 * - Amount (INR / Rs / ₹)
 * - Bank identity & Last 4 digits of Account (e.g. Axis XX001664, HDFC XX5981)
 * - Real transaction date (DD-MM-YYYY, DD-MM-YY, DD-Mon-YY, DDMonYY, ISO)
 * - Merchant / Sender / VPA / Note
 * - Available balance
 * - Smart spending category
 */

// Month name to 2-digit number
const MONTH_MAP = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
};

// Known Indian Banks metadata (Names & Branding Colors)
export const INDIAN_BANKS = [
  { key: 'sbi', name: 'SBI', color: '#280071', regex: /sbi\b|state\s*bank/i },
  { key: 'hdfc', name: 'HDFC Bank', color: '#004c8f', regex: /hdfc\s*bank|hdfc\b/i },
  { key: 'icici', name: 'ICICI Bank', color: '#f37021', regex: /icici\s*bank|icici\b/i },
  { key: 'axis', name: 'Axis Bank', color: '#97144d', regex: /axis\s*bank|axis\b/i },
  { key: 'kotak', name: 'Kotak Bank', color: '#ed1c24', regex: /kotak\b/i },
  { key: 'canara', name: 'Canara Bank', color: '#0091df', regex: /canara\b/i },
  { key: 'pnb', name: 'PNB', color: '#a20034', regex: /pnb\b|punjab\s*national/i },
  { key: 'bob', name: 'Bank of Baroda', color: '#f26522', regex: /baroda\b|bob\b/i },
  { key: 'kvb', name: 'KVB', color: '#047857', regex: /kvb\b|karur/i },
  { key: 'indian', name: 'Indian Bank', color: '#005baa', regex: /indian\s*bank|indbank/i },
  { key: 'iob', name: 'Indian Overseas Bank', color: '#004b87', regex: /iob\b|indian\s*overseas/i },
  { key: 'boi', name: 'Bank of India', color: '#f37021', regex: /boi\b|bank\s*of\s*india/i },
  { key: 'union', name: 'Union Bank', color: '#d2232a', regex: /union\s*bank/i },
  { key: 'idfc', name: 'IDFC FIRST Bank', color: '#9d1d27', regex: /idfc\b/i },
  { key: 'indusind', name: 'IndusInd Bank', color: '#851b21', regex: /indusind\b/i },
  { key: 'federal', name: 'Federal Bank', color: '#004b87', regex: /federal\b/i },
  { key: 'yes', name: 'Yes Bank', color: '#0b5299', regex: /yes\s*bank/i },
  { key: 'rbl', name: 'RBL Bank', color: '#004380', regex: /rbl\b/i },
  { key: 'central', name: 'Central Bank', color: '#005a9c', regex: /central\s*bank/i },
  { key: 'uco', name: 'UCO Bank', color: '#0072bc', regex: /uco\b/i },
  { key: 'paytm', name: 'Paytm Bank', color: '#00b9f5', regex: /paytm/i },
  { key: 'airtel', name: 'Airtel Bank', color: '#e40000', regex: /airtel\s*bank|airtel\s*money/i },
  { key: 'phonepe', name: 'PhonePe', color: '#5f259f', regex: /phonepe/i },
  { key: 'jupiter', name: 'Jupiter (Federal)', color: '#ff6f00', regex: /jupiter/i },
  { key: 'fi', name: 'Fi Money', color: '#00c0a3', regex: /fi\s*money|epifi/i },
  { key: 'supermoney', name: 'Supermoney UPI', color: '#9333ea', regex: /supermoney/i },
  { key: 'gpay', name: 'Google Pay (UPI)', color: '#4285f4', regex: /gpay|google\s*pay/i }
];

/**
 * Extract real transaction date across Indian bank formats.
 * Handles:
 * - DD-MM-YYYY (Axis: 17-10-2026 22:12:28 IST)
 * - DD-MM-YY (HDFC: 19-10-26)
 * - DD-Mon-YY or DD-Mon-YYYY (KVB: 18-Oct-26, 18-Oct-2026)
 * - DDMonYY (SBI: 14Oct26)
 * - DD/MM/YYYY or DD/MM/YY
 * - YYYY-MM-DD (ISO)
 */
export function extractDate(text) {
  // Format 1: DD-Mon-YY or DD-Mon-YYYY with dashes or spaces (e.g. 18-Oct-26, 18-Oct-2026, 18 Oct 2026)
  const fmt1 = text.match(/(\d{1,2})[- ]([A-Za-z]{3})[- ](\d{2,4})/);
  if (fmt1) {
    const day = fmt1[1].padStart(2, '0');
    const month = MONTH_MAP[fmt1[2].toLowerCase()];
    let year = fmt1[3];
    if (year.length === 2) year = '20' + year;
    if (month) return `${year}-${month}-${day}`;
  }

  // Format 2: DDMonYY or DDMonYYYY without separator (SBI: 14Oct26, 01Oct2026)
  const fmt2 = text.match(/(\d{1,2})([A-Za-z]{3})(\d{2,4})/);
  if (fmt2) {
    const day = fmt2[1].padStart(2, '0');
    const month = MONTH_MAP[fmt2[2].toLowerCase()];
    let year = fmt2[3];
    if (year.length === 2) year = '20' + year;
    if (month) return `${year}-${month}-${day}`;
  }

  // Format 3: DD-MM-YYYY or DD/MM/YYYY (Axis: 17-10-2026)
  const fmt3 = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (fmt3) {
    const day = fmt3[1].padStart(2, '0');
    const month = fmt3[2].padStart(2, '0');
    const year = fmt3[3];
    return `${year}-${month}-${day}`;
  }

  // Format 4: DD-MM-YY or DD/MM/YY (HDFC: 19-10-26)
  const fmt4 = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})\b/);
  if (fmt4) {
    const day = fmt4[1].padStart(2, '0');
    const month = fmt4[2].padStart(2, '0');
    const year = '20' + fmt4[3];
    return `${year}-${month}-${day}`;
  }

  // Format 5: YYYY-MM-DD (ISO)
  const fmt5 = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (fmt5) return fmt5[0];

  // Fallback: today's date
  return new Date().toISOString().split('T')[0];
}

/**
 * Extract Account last 4 digits (e.g. XX001664 -> 1664, XX5981 -> 5981, 1516 -> 1516)
 */
export function extractAccountDigits(text) {
  // Matches "A/c no. XX001664", "A/c XX5981", "Acct XX4567", "a/c XXXXXXXXXXXX1516", "A/C 1234", "AC XX8901"
  const m = text.match(/(?:a\/c(?:\s*no\.?)?|acct|account|ac)\s*(?:no\.?)?\s*[:\-]?\s*([xX*]*\d{3,6})\b/i);
  if (m && m[1]) {
    const digitsOnly = m[1].replace(/\D/g, '');
    if (digitsOnly.length >= 3) {
      return digitsOnly.slice(-4);
    }
  }

  // Matches "ending 1516", "ending in 1516", "ending with 1516"
  const mEnd = text.match(/(?:ending|end)\s*(?:in|with|no\.?)?\s*([xX*]*\d{3,6})\b/i);
  if (mEnd && mEnd[1]) {
    const digitsOnly = mEnd[1].replace(/\D/g, '');
    if (digitsOnly.length >= 3) return digitsOnly.slice(-4);
  }

  return null;
}

/**
 * Detect Bank name and branding color from SMS text or sender
 */
export function detectBank(text, sender = '') {
  const combined = `${sender} ${text}`;
  for (const b of INDIAN_BANKS) {
    if (b.regex.test(combined)) {
      return b;
    }
  }
  return { key: 'bank', name: 'Bank Account', color: '#3b82f6' };
}

/**
 * Extract merchant, party, or VPA description from SMS
 */
export function extractNote(text) {
  // 1. Axis pattern: "on [MERCHANT] DD-MM-YYYY" (e.g. "on ROSHAN TRAD 17-10-2026")
  const axisOnMatch = text.match(/\bon\s+([A-Za-z0-9\s&._\-]{2,35}?)\s+\d{1,2}[-\/]/i);
  if (axisOnMatch && axisOnMatch[1]) {
    const candidate = axisOnMatch[1].trim();
    if (!/account|bank|alert|acct/i.test(candidate)) {
      return candidate.slice(0, 40);
    }
  }

  // 2. HDFC pattern: "from VPA [VPA]" (e.g. "from VPA *asen@okhdfcbank")
  const vpaMatch = text.match(/from VPA\s+([A-Za-z0-9*@._\-]+)/i);
  if (vpaMatch && vpaMatch[1]) {
    return vpaMatch[1].trim().slice(0, 40);
  }

  // 3. Common Indian Bank & UPI Merchant patterns
  const merchantPatterns = [
    /by upi to\s+([A-Za-z0-9@._\-\s]+?)(?:\.|avl|ref|$)/i,
    /(?:trf to|transfer to)\s+([A-Za-z0-9@._\-\s]+?)(?:\.|avl|ref|$)/i,
    /info:\s*([A-Za-z0-9\s&._-]+?)(?:\.|avl|$)/i,
    /towards\s+([A-Za-z0-9\s&._-]+?)(?:\s+on|\.|\s+avl|$)/i,
    /\bto\s+([A-Za-z0-9\s&._\-]{2,35}?)(?:\s+on|\.|\s+avl|\s+ref|\s+upi|$)/i,
    /from\s+([A-Za-z0-9*@._\-\s]{2,35}?)(?:\s+on|\.|\s+avl|\s+ref|\s+upi|\(upi|$)/i,
    /at\s+([A-Za-z0-9\s&._\-]{2,35}?)(?:\s+on|\.|\s+avl|$)/i
  ];

  for (const pattern of merchantPatterns) {
    const m = text.match(pattern);
    if (m && m[1] && m[1].trim().length > 1) {
      const cleaned = m[1].trim().replace(/^[\s,\.\-]+|[\s,\.\-]+$/g, '');
      if (!/account|bank|alert|vpa|credited|debited/i.test(cleaned)) {
        return cleaned.slice(0, 40);
      }
    }
  }

  return 'Bank Transaction';
}

/**
 * Auto-categorize based on transaction type and message keywords
 */
export function categorizeTransaction(type, text) {
  if (type === 'credit') {
    if (/salary|payroll|stipend/i.test(text)) return 'Salary';
    if (/cashback|reward/i.test(text)) return 'Cashback & Rewards';
    if (/interest|dividend/i.test(text)) return 'Investment / Returns';
    if (/freelance|consulting/i.test(text)) return 'Freelance';
    return 'Money Received';
  }

  const lc = text.toLowerCase();
  if (/swiggy|zomato|mcdonald|kfc|pizza|restaurant|cafe|hotel|tea|bakes|food|dining|bakery/i.test(lc))
    return 'Food & Dining';
  if (/amazon|flipkart|myntra|meesho|ajio|nykaa|shopping|zara|h&m|mall|fashion|roshan trad/i.test(lc))
    return 'Shopping';
  if (/petrol|fuel|hpcl|bpcl|iocl|shell|uber|ola|rapido|metro|irctc|fastag|nhai|toll|train|flight/i.test(lc))
    return 'Travel & Fuel';
  if (/airtel|jio|vi\b|bsnl|bescom|tneb|electricity|water|recharge|bill|broadband|act\b|dth|tatasky/i.test(lc))
    return 'Bills & Recharge';
  if (/dmart|supermarket|grocery|zepto|blinkit|instamart|bigbasket|reliance\s*fresh|kirana|spencer/i.test(lc))
    return 'Groceries';
  if (/apollo|pharmacy|medplus|hospital|clinic|doctor|health|lab|medic|dental|netmeds/i.test(lc))
    return 'Health & Medical';
  if (/netflix|prime|hotstar|bookmyshow|pvr|inox|cinema|spotify|youtube|entertainment|movie/i.test(lc))
    return 'Entertainment';
  if (/school|college|udemy|coursera|fee|tuition|book|education/i.test(lc))
    return 'Education';

  return 'General / Other';
}

/**
 * Parse a single bank SMS and return extracted transaction data.
 */
export function parseBankSMS(smsText, userId = null, defaultProfileId = null, sender = '') {
  if (!smsText || typeof smsText !== 'string') {
    return { success: false, error: 'Empty or invalid SMS message.' };
  }

  const text = smsText.trim();

  // 1. Determine transaction type (Credit vs Debit)
  let type = null;
  const isCredit = /credit\s*alert|credited|credit\b|deposited|received|added|refund|cr\s*to|reversal/i.test(text);
  const isDebit = /debit\s*alert|debited|debit\b|withdrawn|spent|paid|sent\b|deducted|payment to|purchase at|dr\s*to/i.test(text);

  if (isCredit && !isDebit) {
    type = 'credit';
  } else if (isDebit && !isCredit) {
    type = 'debit';
  } else if (isCredit && isDebit) {
    // If both keywords appear, check which action happened to the user's account
    if (/credited\s+to|credit\s+alert|is\s+credited/i.test(text)) {
      type = 'credit';
    } else {
      type = 'debit';
    }
  } else {
    return { success: false, error: 'Not a bank transaction SMS (no debit/credit keyword found).' };
  }

  // 2. Extract transaction amount (e.g. INR 2000.00, Rs.10.00, Rs. 450, ₹1,200.50, debited by 500.00)
  let amount = null;
  const amtMatch1 = text.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (amtMatch1) {
    amount = parseFloat(amtMatch1[1].replace(/,/g, ''));
  } else {
    // Fallback: "debited by 500.00" or "credited by 25000.00"
    const amtMatch2 = text.match(/(?:debited|credited|spent|paid|sent)\s*(?:by|for)?\s*([\d,]+(?:\.\d{1,2})?)/i);
    if (amtMatch2) {
      amount = parseFloat(amtMatch2[1].replace(/,/g, ''));
    }
  }

  if (amount === null || isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Could not find a valid transaction amount.' };
  }

  // 3. Extract real transaction date
  const date = extractDate(text);

  // 4. Extract available balance
  let availableBalance = null;
  const balMatch = text.match(/(?:avl\s*bal(?:ance)?|available\s*bal(?:ance)?|bal(?:ance)?\s*(?:is|:)?)\s*(?:is|:)?\s*(?:rs\.?|inr|₹)?\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (balMatch) {
    const b = parseFloat(balMatch[1].replace(/,/g, ''));
    if (!isNaN(b)) availableBalance = b;
  }

  // 5. Detect Bank and Account digits
  const bank = detectBank(text, sender);
  const accountDigits = extractAccountDigits(text);
  const accountName = accountDigits
    ? `${bank.name} A/c ...${accountDigits}`
    : bank.name;

  // 6. Extract merchant / party / note
  const note = extractNote(text);

  // 7. Auto-categorize
  const category = categorizeTransaction(type, text);

  // 8. Generate fingerprint for duplicate prevention
  const fingerprint = `${date}_${type}_${amount}_${accountDigits || bank.key}`;

  return {
    success: true,
    data: {
      type,
      amount,
      bank_name: bank.name,
      bank_key: bank.key,
      bank_color: bank.color,
      account_digits: accountDigits,
      account_name: accountName,
      category,
      note,
      date,
      profile_id: defaultProfileId,
      available_balance: availableBalance,
      fingerprint,
      raw_sms: text
    }
  };
}

/**
 * Bulk parser: scans a big block of text containing multiple SMS messages,
 * splits them on bank message starters or double newlines,
 * parses each SMS, and returns all parsed transactions.
 */
export function parseBulkSMS(bulkText, userId = null, defaultProfileId = null) {
  if (!bulkText || typeof bulkText !== 'string') {
    return { success: false, error: 'No text provided.' };
  }

  const lines = bulkText.split(/\r?\n+/);
  const messages = [];
  let current = [];

  // Patterns indicating start of a new bank SMS (with substance)
  const startPattern = /^(?:inr\s+\d|rs\.?\s*\d|₹\s*\d|dear\s+|your a\/c|sent\s+rs|paid\s+rs|transferred\s+rs|a\/c\s+|acct\s+)/i;
  const alertHeaderPattern = /^(?:credit alert|debit alert|alert[:!]|transaction alert)/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.length > 0) {
        messages.push(current.join(' '));
        current = [];
      }
      continue;
    }

    // If this line is an alert header, don't split if current buffer is empty, but if current already has content, start new
    const isAlertHeader = alertHeaderPattern.test(trimmed);
    const isStandardStart = startPattern.test(trimmed);

    if ((isStandardStart || isAlertHeader) && current.length > 0) {
      // If current buffer only contains an alert header, don't split yet — append to it!
      const currentText = current.join(' ');
      if (alertHeaderPattern.test(currentText) && !/\d/.test(currentText)) {
        // Just the header so far, keep going
      } else {
        messages.push(currentText);
        current = [];
      }
    }
    current.push(trimmed);
  }
  if (current.length > 0) messages.push(current.join(' '));

  const parsed = [];
  const skipped = [];

  for (const msg of messages) {
    if (!msg.trim()) continue;
    const result = parseBankSMS(msg, userId, defaultProfileId);
    if (result.success) {
      parsed.push(result.data);
    } else {
      skipped.push({ text: msg.slice(0, 90), reason: result.error });
    }
  }

  return {
    success: true,
    parsed,
    skipped,
    summary: {
      total: messages.length,
      detected: parsed.length,
      skipped: skipped.length
    }
  };
}
