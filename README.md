离线支付码生成工具
================


### 介绍
主要就是利用[TOTP](https://en.wikipedia.org/wiki/Time-based_One-time_Password_Algorithm)算法生成一个6位(默认)数字的一次性密码pin, 再由给定的`32`位uid异或加密得到最终的code.
此工具暴露三个接口, 分别是
1. secretKey的生成
2. code生成
3. code校验

当然，如果你对secretKey的生成有自己的一套生成算法也可以，看具体需求.

### 安装
```bash
npm i offline-pay-code

# or
yarn add offline-pay-code
```

### 测试
```bash
npm run test
```

### 事列
```javascript
const payCode = require('offline-pay-code')

const options = {
    period: 30,
    digits: 6,
    algorithm: 'sha1',
}
const key = payCode.secretKey()
const uid = 212123456 //这只是一个范例
const code = payCode.getCode(key, uid, options)

// 验证
const verifyRet = payCode.verify(key, code, options)
// success: { code: 0, data: 212123456 }
// fail: { code: -1, msg: 'verify fail' }

```