const crypto = require('crypto');

function generateSecureHash(payload, secretKeyHex) {
  const data = [
    `Amount=${payload.Amount}`,
    `Currency=${payload.Currency}`,
    `DateTimeLocalTrxn=${payload.DateTimeLocalTrxn}`,
    `MerchantId=${payload.MerchantId}`,
    `TerminalId=${payload.TerminalId}`,
  ].join('&');

  const key = Buffer.from(secretKeyHex, 'hex');

  return crypto.createHmac('sha256', key).update(data).digest('hex').toUpperCase();
}

module.exports = generateSecureHash;
