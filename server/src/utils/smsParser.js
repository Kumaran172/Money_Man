/**
 * Smart Indian Bank & UPI SMS Parser Engine (v2)
 * - Extracts REAL transaction dates from KVB message text
 * - Supports bulk multi-message parsing for history import
 * - Duplicate-detection fingerprint generation
 */

// Month name to number map
const MONTH_MAP = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
};

/**
 * Extract real date from KVB SMS text.
 * Handles formats like: "18-Oct-26", "18/10/2026", "18-10-2026", "Oct 18, 2026"
 */
function extractDate(text) {
  // Format 1: DD-Mon-YY or DD-Mon-YYYY (KVB native format)
  const fmt1 = text.match(/(\d{1,2})[- ]([A-Za-z]{3})[- ](\d{2,4})/);
  if (fmt1) {
    const day = fmt1[1].padStart(2, '0');
    const month = MONTH_MAP[fmt1[2].toLowerCase()];
    let year = fmt1[3];
    if (year.length === 2) year = '20' + year;
    if (month) return `${year}-${month}-${day}`;
  }

  // Format 2: DD/MM/YYYY or DD-MM-YYYY
  const fmt2 = text.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  if (fmt2) {
    return `${fmt2[3]}-${fmt2[2]}-${fmt2[1]}`;
  }

  // Format 3: YYYY-MM-DD (ISO)
  const fmt3 = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (fmt3) {
    return fmt3[0];
  }

  // Fallback: today's date
  return new Date().toISOString().split('T')[0];
}

/**
 * Parse a single bank SMS and return extracted transaction data.
 */
export function parseBankSMS(smsText, userId = null, defaultProfileId = null) {
  if (!smsText || typeof smsText !== 'string') {
    return { success: false, error: 'Empty or invalid SMS message.' };
  }

  const text = smsText.trim();

  // 1. Determine transaction type
  let type = null;
  if (/debited|debit|withdrawn|spent|paid|sent to|deducted/i.test(text)) {
    type = 'debit';
  } else if (/credited|credit|deposited|received|added|refund/i.test(text)) {
    type = 'credit';
  } else {
    return { success: false, error: 'Not a bank transaction SMS (no debit/credit keyword found).' };
  }

  // 2. Extract amount (Rs. 350, Rs.350.00, INR 1,200.50, ₹450)
  const amountMatch = text.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (!amountMatch) {
    return { success: false, error: 'Could not find a valid transaction amount.' };
  }
  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Extracted amount is invalid.' };
  }

  // 3. Extract real date from the SMS text
  const date = extractDate(text);

  // 4. Extract available balance
  let availableBalance = null;
  const balMatch = text.match(/(?:avl\s*bal|available\s*bal(?:ance)?|bal(?:ance)?\s*(?:is|:)?)\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (balMatch) {
    const b = parseFloat(balMatch[1].replace(/,/g, ''));
    if (!isNaN(b)) availableBalance = b;
  }

  // 5. Identify account by bank name/number
  let accountSuffix = userId ? `_${userId}` : '';
  let accountId = `acc_kvb${accountSuffix}`;
  let accountName = 'KVB A/c ...1516';

  if (/1516|kvb|karur/i.test(text)) {
    accountId = `acc_kvb${accountSuffix}`;
    accountName = 'KVB A/c ...1516';
  } else if (/hdfc/i.test(text)) {
    accountId = `acc_bank${accountSuffix}`;
    accountName = 'HDFC Bank';
  } else if (/supermoney/i.test(text)) {
    accountId = `acc_supermoney${accountSuffix}`;
    accountName = 'Supermoney UPI';
  } else if (/gpay|google\s*pay/i.test(text)) {
    accountId = `acc_gpay${accountSuffix}`;
    accountName = 'Google Pay (UPI)';
  }

  // 6. Extract merchant/note from UPI reference
  let note = 'Bank Transaction';
  const merchantPatterns = [
    /by upi to ([A-Za-z0-9@._\-\s]+?)(?:\.|avl|ref|$)/i,
    /towards ([A-Za-z0-9\s&._-]+?)(?:\s+on|\.|\s+avl|$)/i,
    /at ([A-Za-z0-9\s&._-]+?)(?:\s+on|\.|\s+avl|$)/i,
    /info:\s*([A-Za-z0-9\s&._-]+?)(?:\.|avl|$)/i,
  ];
  for (const pattern of merchantPatterns) {
    const m = text.match(pattern);
    if (m && m[1] && m[1].trim().length > 1) {
      note = m[1].trim().slice(0, 40);
      break;
    }
  }

  // 7. Auto-categorize based on merchant keywords
  let category = type === 'credit' ? 'Money Received' : 'General / Other';
  if (type === 'credit') {
    if (/salary/i.test(text))                category = 'Salary';
    else if (/cashback|reward/i.test(text))   category = 'Cashback & Rewards';
    else if (/interest/i.test(text))          category = 'Interest / Returns';
    else if (/freelance|project/i.test(text)) category = 'Freelance';
  } else {
    const lc = text.toLowerCase();
    if (/swiggy|zomato|mcdonald|kfc|pizza|restaurant|cafe|hotel|tea|bakes|food/i.test(lc))
      category = 'Food & Dining';
    else if (/amazon|flipkart|myntra|meesho|ajio|nykaa|shopping|zara/i.test(lc))
      category = 'Shopping';
    else if (/petrol|fuel|hpcl|bpcl|iocl|shell|uber|ola|rapido|metro|irctc|fastag|nhai/i.test(lc))
      category = 'Travel & Fuel';
    else if (/airtel|jio|vi\b|bsnl|bescom|tneb|electricity|water|recharge|bill|broadband|act\b/i.test(lc))
      category = 'Bills & Recharge';
    else if (/dmart|supermarket|grocery|zepto|blinkit|instamart|bigbasket|reliance\s*fresh/i.test(lc))
      category = 'Groceries';
    else if (/apollo|pharmacy|medplus|hospital|clinic|doctor|health|lab|medic/i.test(lc))
      category = 'Health & Medical';
    else if (/netflix|prime|hotstar|bookmyshow|pvr|inox|cinema|spotify|youtube/i.test(lc))
      category = 'Entertainment';
    else if (/school|college|udemy|coursera|fee|tuition|book/i.test(lc))
      category = 'Education';
  }

  // 8. Generate a fingerprint for duplicate detection
  const fingerprint = `${date}_${type}_${amount}`;

  return {
    success: true,
    data: {
      type,
      amount,
      account_id: accountId,
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
 * Bulk parser: scans a big block of text (many messages pasted together),
 * splits on newlines and tries to parse each group as a separate SMS.
 * Returns an array of parsed results and a summary.
 */
export function parseBulkSMS(bulkText, userId = null, defaultProfileId = null) {
  if (!bulkText || typeof bulkText !== 'string') {
    return { success: false, error: 'No text provided.' };
  }

  // Split text into individual messages: look for KVB patterns or bank headers
  // We try splitting by known KVB sentence starters
  const lines = bulkText.split(/\n+/);

  // Group lines into individual SMS messages
  const messages = [];
  let current = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.length > 0) {
        messages.push(current.join(' '));
        current = [];
      }
      continue;
    }
    // Detect new message start: starts with "Your a/c" or "Dear Customer"
    if (/^Your a\/c|^Dear customer|^Dear\s+\w|^Alert:/i.test(trimmed) && current.length > 0) {
      messages.push(current.join(' '));
      current = [];
    }
    current.push(trimmed);
  }
  if (current.length > 0) messages.push(current.join(' '));

  // Parse each message
  const parsed = [];
  const skipped = [];

  for (const msg of messages) {
    if (!msg.trim()) continue;
    const result = parseBankSMS(msg, userId, defaultProfileId);
    if (result.success) {
      parsed.push(result.data);
    } else {
      skipped.push({ text: msg.slice(0, 80), reason: result.error });
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
