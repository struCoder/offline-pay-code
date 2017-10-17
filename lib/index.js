'use strict'
const crypto = require('crypto');
const base32 = require('thirty-two');

const TH_NUM = 1000;
const MAX_UID = Math.pow(2, 31);

function leftPad (str, len, ch) {
  //convert the `str` to String
  str = str + '';
     
  //needn't to pad
  len = len - str.length;
  if (len <= 0) return str;
     
  //convert the `ch` to String
  if (!ch && ch !== 0) ch = ' ';
  ch = ch + '';
     
  let pad = '';
  while (true) {
    if (len & 1) pad += ch;
    len >>= 1;
    if (len) ch += ch;
    else break;
  }
  return pad + str;
}

function hexToInt(hex) {
  return parseInt(hex, 16)
}

function intToHex(val) {
  return parseInt(val, 10).toString(16)
}

function counter(period) {
  const counter = totpCounter(Date.now(), period)
  return leftPad(intToHex(counter), 16, 0)
}

function totpCounter(timeAt, steps){
  return Math.floor(timeAt / steps / TH_NUM)
}

function padSecret(secretBuffer, size) {
  var len = secretBuffer.length;
  if (size && len < size) {
    var newSecret = new Array(size - len + 1).join(secretBuffer.toString('hex'));
    return new Buffer(newSecret, 'hex').slice(0, size);
  }
  return secretBuffer;
}


function totpSecret(secret, options) {
  var encoded = new Buffer(secret, 'hex');
  switch (options.algorithm.toLowerCase()) {
    case 'sha1':
      return padSecret(encoded, 20);
    case 'sha256':
      return padSecret(encoded, 32);
    case 'sha512':
      return padSecret(encoded, 64);
    default:
      return encoded;
  }
}

// generate secretKeyy
function secretKey(length) {
  length = length || 20;

  const secretStr = crypto.randomBytes(length).toString('base64').slice(0, length);

  const encodedSecretStr = base32.encode(secretStr).toString().replace(/=/g, '');
  return encodedSecretStr;
}

// get totp code
function otpToken(secret, options) {
  secret = base32.decode(secret.toUpperCase()).toString('hex')
  const defaultOptions = {
    period: 30,
    digits: 6,
    algorithm: 'sha1',
  }
  const opts = Object.assign(defaultOptions, options)
  const cryptoHmac = crypto.createHmac(opts.algorithm, totpSecret(secret, opts))
  let hmac = cryptoHmac.update(new Buffer(counter(opts.period), 'hex')).digest('hex');
  const offset = hexToInt(hmac.substr(hmac.length - 1));

  const truncatedHash = hmac.substr(offset * 2, 8);
  const sigbit0 = hexToInt(truncatedHash) & hexToInt('7fffffff');
  const code = Math.pow(10, opts.digits);
  // token: truncateHash mod 1000000
  const token = sigbit0 % code;
  return leftPad(token, opts.digits, 0)
}

function getCode(secret, uid, options) {
  if (uid > MAX_UID) {
    throw new Error('make sure that your uid under: ' + MAX_UID)
  }
  const pinToken = otpToken(secret, options);
  

  const XORToken = uid ^ pinToken
  return `${XORToken}${pinToken}`
}

function verify(secret, code, options) {
  code = code.toString()
  const otp = code.slice(code.length - 6)
  // verify otptoken
  const sysToken = otpToken(secret, options)
  if (otp !== sysToken) {
    return {
      code: -1,
      msg: 'verify fail'
    }
  }

  const encodedUid = code.slice(0, code.length - 6)
  // get origin uid
  const uid = encodedUid ^ otp
  return {
    code: 0,
    data: uid,
  }
}

exports.secretKey = secretKey;
exports.getCode = getCode;
exports.verify = verify;