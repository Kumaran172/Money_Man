/**
 * Educational Middleware: Transaction Input Validator
 * 
 * WHY USE VALIDATION MIDDLEWARE:
 * Without validation, bad data (e.g. negative numbers, missing accounts, null values)
 * would enter your database and break your charts and calculations.
 * 
 * This middleware stops bad requests AT THE DOOR before they ever touch the database!
 */
export function validateTransaction(req, res, next) {
  const { amount, type, account_id, category } = req.body;

  // 1. Check if required fields exist
  if (amount === undefined || amount === null || amount === '') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error: "amount" is required.'
    });
  }

  // 2. Validate amount is a positive number
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error: "amount" must be a positive number greater than 0.'
    });
  }

  // 3. Validate transaction type
  if (!['credit', 'debit'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error: "type" must be either "credit" (income) or "debit" (expense).'
    });
  }

  // 4. Validate category
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error: "category" name is required.'
    });
  }

  // 5. Validate account_id
  if (!account_id || typeof account_id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error: "account_id" is required (e.g., acc_gpay, acc_supermoney).'
    });
  }

  // Sanitize the amount onto the request object so downstream handlers get clean parsed numbers
  req.body.amount = parsedAmount;

  // Everything is valid! Pass control to the route handler
  next();
}
