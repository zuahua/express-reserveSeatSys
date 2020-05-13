const crypto = require('crypto');

/**
 * 对密码进行加密
 * @param {*} password
 */
function encrypt(password) {
	const hmac = crypto.createHmac('sha256', password)
		.update(password)
		.digest('hex');
	return hmac
}


/**
 * 验证密码
 * @param {*} hmac 加密后的hmac
 * @param {*} password 输入密码
 */
function verify(hmac, password) {
	const hmacPassword = crypto.createHmac('sha256', password)
		.update(password)
		.digest('hex');
	if (hmacPassword === hmac) {
		return true
	}
	else {
		return false
	}
}

// const hmac = encrypt('xxxxxx')
// console.log(verify(hmac, 'xxxxxx'))

module.exports = { encrypt, verify }