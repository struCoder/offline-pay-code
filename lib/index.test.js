'use strict';

const deps = require('.')

const secretKey = deps.secretKey;
const getCode = deps.getCode;
const verify = deps.verify;

test('test offline pay code', () => {
  const key = secretKey()
  const code = getCode(key, 212123456)
  const verifyRet = verify(key, code)
  expect(verifyRet.code).toBe(0)
})
