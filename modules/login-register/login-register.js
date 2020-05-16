// 登录、注册、忘记密码

const pool = require('../sql/conn')
const {
	getConnectionQuery
} = require('../sql/CRUD')
const sendMail = require('../mail/sendMail') // 发送邮件
const {
	renderValidatePage
} = require('../mail/renderTpl') // 渲染邮箱验证内容模板

const {
	encrypt,
	verify
} = require('../crypto/crypto')

var svgCaptcha = require('svg-captcha') // 验证码

const saveSession = require('./saveSession') // 保存用户 sesssion


/**
 * 1 注册处理函数
 *	@param req: req对象
 * @param {参数数据 Object
 * 	参数：usernameRe emailRe passwdRe rePasswdRe validateRe} body
 * @param {*} callback
 * 	参数 err:
 *
 */
function register(session, body, callback) {
	try {
		let {
			usernameRe,
			emailRe,
			passwdRe,
			rePasswdRe,
			validateRe
		} = body
		// console.log(body)
		let validateCode = session.captchaRegister // 图片验证码 session
		// console.log(validateCode)
		if (usernameRe === '' || emailRe === '' || passwdRe === '' || rePasswdRe === '' || validateRe === '') { // 用户信息有空
			return callback('用户信息有空')
		} else if (usernameRe.length > 6) { // 用户名 小于等于6位
			return callback('用户名长度不能大于6位')
		} else if (!emailRe.match(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)) { // 邮箱格式
			return callback('邮箱格式不正确')
		} else if (emailRe.length > 40) { // 邮箱长度不能大于40位
			return callback('邮箱长度不能大于40位')
		} else if (passwdRe.length < 6 || passwdRe.length > 20) { // 密码长度不能小于6位、大于20位
			return callback('密码长度不能小于6位、大于20位')
		} else if (rePasswdRe !== passwdRe) { // 两次密码不一致
			return callback('两次密码不一致')
		} else if (validateRe.toLowerCase() !== validateCode.toLowerCase()) { // 图片验证码错误
			// console.log(validateRe.toLowerCase() + '--' + validateCode.toLowerCase())
			return callback('图片验证码错误')
		}

		// 删除过期未验证用户
		deleteExpRow((err) => {
			if (err) {
				return callback('数据更新错误')
			}
		})

		// 查询用户名和邮箱是否被使用
		let queryStr1 = `SELECT username FROM users WHERE username='${usernameRe}'`
		let queryStr2 = `SELECT mail FROM users WHERE mail='${emailRe}'`
		let queryStr = queryStr1 + '; ' + queryStr2

		getConnectionQuery(pool, queryStr, (err, results) => {
			if (err) {
				// console.log(err)
				return callback(err)
			} else {
				// console.log(results)
				if (results[0].length > 0) { // 用户名被使用
					return callback('用户名被使用')
				} else if (results[1].length > 0) { // 邮箱被使用
					return callback('邮箱被使用')
				} else { // 用户名和邮箱都未被使用
					// 将数据插入表
					let hmac = encrypt(passwdRe)
					let token = encrypt(usernameRe + emailRe + passwdRe)
					let token_exptime = genExpTime()
					let queryStr3 = `INSERT INTO users (username, mail, password, token, token_exptime) VALUES ("${usernameRe}", "${emailRe}", "${hmac}", "${token}", ${token_exptime})`

					getConnectionQuery(pool, queryStr3, (err, results) => {
						if (err) {
							callback(err)
						} else {
							// 插入数据成功后
							let html = renderValidatePage(token, emailRe)
							// 发送邮件
							sendMail(emailRe, '欢迎注册', html, (err, re) => {
								if (err !== null) {
									// console.log('发送失败')
									return callback('发送失败')
								} else {
									// console.log('邮件发送成功')
									callback(null)
								}
							})
							// console.log('成功');
						}
					})
				}
			}
		})
	} catch (err) {
		return callback(err)
	}

}

//#region 2 构建注册验证过期时间
// 构建 注册验证过期时间 过期时间加一天 返回 秒
function genExpTime() {
	// 秒需要除1000
	const expTS = (Date.now() + 24 * 60 * 60 * 1000) / 1000
	return expTS
}
// console.log(genExpTime());
//#endregion

//#region 3 构建邮箱验证码过期时间
// 构建 注册验证过期时间 过期时间 5分钟 返回 秒
function genMailValidateExpTime() {
	// 秒需要除1000
	const expTS = (Date.now() + 5 * 60 * 1000) / 1000
	return expTS
}
// console.log(genExpTime());
//#endregion

//#region 4 注册操作数据前 先删除过期未验证的记录
/**
 * 注册操作数据前 先删除过期未验证的记录
 * @param {*} callback 回调：(err) => {} err = err or null
 */
function deleteExpRow(callback) {
	try {
		// 获取当前时间戳 秒为单位
		let tsNow = Date.now() / 1000
		// console.log(tsNow)
		let queryStr = `DELETE FROM users WHERE token_exptime < ${tsNow} AND active_status=0`
		getConnectionQuery(pool, queryStr, (err, results) => {
			if (err) {
				// console.log(err)
				callback(err)
			} else {
				// console.log(results)
				callback(null)
			}
		})
	} catch (err) {
		callback(err)
	}
}

// 执行
// deleteExpRow((err) => {
// 	if (err) {
// 		console.log('错误')
// 		return callback('数据更新错误')
// 	}
// })
//#endregion

//#region 5 注册邮箱验证功能
/**
 * 注册邮箱验证功能
 * @param {*} query 查询字符串：token, mail
 * @param {*} callback 回调：err => {} , err = err or null
 */
function mailValidate(query, callback) {
	try {
		let {
			token,
			mail
		} = query
		// console.log(token, mail)
		let queryStr1 = `SELECT mail FROM users WHERE mail='${mail}'` // 查询此邮箱
		getConnectionQuery(pool, queryStr1, (err, results) => {
			if (err) {
				// console.log(err)
				return callback(err)
			} else {
				// console.log(results)
				if (results.length !== 1) { // 此邮箱未注册，请重新注册
					return callback('此邮箱未注册，请重新注册')
				} else { // 有此邮箱
					// 查询 token 字段
					let queryStr2 = `SELECT token FROM users WHERE token='${token}' AND mail='${mail}'`
					getConnectionQuery(pool, queryStr2, (err, results) => {
						if (err) {
							// console.log(err)
							return callback(err)
						} else {
							// console.log(results)
							if (results.length !== 1) { // token字段不正确 验证失败
								return callback('验证失败')
							} else { // token字段正确
								// 查询 active_status 字段
								let queryStr3 = `SELECT active_status FROM users WHERE active_status=0 AND mail='${mail}'`
								getConnectionQuery(pool, queryStr3, (err, results) => {
									if (err) {
										// console.log(err)
										return callback(err)
									} else {
										// console.log(results)
										if (results.length !== 1) { // active_status不为0 此邮箱已验证
											return callback('此邮箱已验证')
										} else { // active_status为0 未验证
											// 更新 active_status 字段
											let queryStr4 = `UPDATE users SET active_status=1 WHERE mail='${mail}'`
											getConnectionQuery(pool, queryStr4, (err, results) => {
												if (err) {
													// console.log(err)
													return callback(err)
												} else {
													// 更新成功 验证成功
													return callback(null)
												}
											})
										}
									}
								})
							}
						}
					})
				}
			}
		})
	} catch (err) {
		return callback(err)
	}
}
//#endregion

//#region 6 登录功能
function login(session, body, callback) {
	try {
		// console.log(body)
		const {
			usernameLogin,
			passwdLogin,
			validateLogin,
		} = body
		let validateCode = session.captchaLogin // 图片验证码 session
		// console.log(validateCode)
		// 判断提交是否有空
		if (usernameLogin === '' || passwdLogin === '' || validateLogin === '') {
			return callback('信息有空')
		}
		// 判断是用户名还是邮箱
		if (usernameLogin.length > 6) { // 是邮箱
			if (!usernameLogin.match(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)) { // 邮箱格式
				return callback('邮箱格式不正确')
			} else if (usernameLogin.length > 40) { // 邮箱长度不能大于40位
				return callback('邮箱长度不能大于40位')
			}
		} else if (passwdLogin.length < 6 || passwdLogin.length > 20) { // 密码长度不能小于6位、大于20位
			return callback('密码长度不能小于6位、大于20位')
		} else if (validateLogin.toLowerCase() !== validateCode.toLowerCase()) { // 图片验证码错误
			return callback('图片验证码错误')
		}

		// 构建 sql 语句
		let queryStr = ''
		if (usernameLogin.length > 6) { // 查询邮箱
			queryStr = `SELECT username,mail,password,active_status FROM users WHERE mail='${usernameLogin}'`
		} else { // 查询用户名
			queryStr = `SELECT username,mail,password,active_status FROM users WHERE username='${usernameLogin}'`
		}

		// 开始查询
		getConnectionQuery(pool, queryStr, (err, results) => {
			if (err) {
				callback(err)
			} else {
				if (results.length !== 1) { // 没有结果 此用户名或邮箱未注册
					callback('此用户名或邮箱未注册')
				} else { // 查到一条记录
					// 获取密码和激活状态
					const {
						username,
						mail,
						password,
						active_status
					} = results[0]
					// 密码是否匹配
					let hmac = encrypt(passwdLogin) // 加密后的密码
					if (hmac !== password) { // 密码错误
						return callback('密码错误')
					} else if (active_status !== 1) { //用户未激活
						return callback('用户未激活')
					} else { // 用户正确 可以登录
						// 保存用户 session
						saveSession(session, username, mail)
						// console.log(session.username)
						return callback(null)
					}
				}
			}
		})
	} catch (err) {
		return callback(err)
	}
}

//#endregion

//#region 7 忘记密码功能
function forgetPassword(session, body, callback) {
	try {
		const validateCode = session.captchaForget
		const {
			emailForget,
			passwdForget,
			rePasswdForget,
			validateForget,
			validateMailForget
		} = body
		if (emailForget === '' || passwdForget === '' || rePasswdForget === '' || validateForget === '' || validateMailForget === '') {
			return callback('提交信息有空')
		} else if (!emailForget.match(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)) { // 邮箱格式
			return callback('邮箱格式不正确')
		} else if (emailForget.length > 40) { // 邮箱长度不能大于40位
			return callback('邮箱长度不能大于40位')
		} else if (passwdForget.length < 6 || passwdForget.length > 20) { // 密码长度不能小于6位、大于20位
			return callback('密码长度不能小于6位、大于20位')
		} else if (rePasswdForget !== passwdForget) { // 两次密码不一致
			return callback('两次密码不一致')
		} else if (validateForget.toLowerCase() !== validateCode.toLowerCase()) { // 图片验证码错误
			return callback('图片验证码错误')
		} else { // 更新密码
			let nowTS = Date.now() / 1000 // 时间戳 s为单位
			let hmac = encrypt(passwdForget) // 加密密码
			let queryStr1 = `SELECT mail, changeKey_validate, changeKey_exptime FROM users WHERE mail='${emailForget}'`
			getConnectionQuery(pool, queryStr1, (err, results) => {
				if (err) {
					return callback(err)
				} else {
					if (results.length !== 1) { // 此邮箱用户不存在
						return callback('此邮箱用户不存在')
					} else { // 有此邮箱，根据邮箱验证码、过期时间 更新密码
						// console.log(results)
						const changeKey_validate = results[0].changeKey_validate
						const changeKey_exptime = results[0].changeKey_exptime
						if (changeKey_validate !== validateMailForget) { // 邮箱验证码不正确
							return callback('邮箱验证码不正确')
						} else if (nowTS > changeKey_exptime) { // 邮箱验证码已过期
							return callback('邮箱验证码已过期')
						} else { // 更新密码
							let queryStr2 = `UPDATE users SET password='${hmac}' WHERE mail='${emailForget}'`
							getConnectionQuery(pool, queryStr2, (err, results) => {
								if (err) {
									return callback(err)
								} else {
									return callback(null)
								}
							})
						}
					}
				}
			})
		}
	} catch (err) {
		return callback(err)
	}
}


//#endregion

//#region 8 重置密码时 发送邮件验证码 将验证码、验证过期时间存入数据库  功能
// 重置密码时 发送邮件验证码 功能
function sendMailValidateCode(mail, callback) {
	try {
		const subject = '重置密码'
		const captcha = svgCaptcha.create({
			size: 6,
			ignoreChars: '',
			noise: 0,
			color: true,
			background: '#faff72',
			fontSize: 30,
			height: 22
		})
		const mailValidateCode = captcha.text // 6位验证码
		const html = `<h3>验证码为：</h3><h1>${mailValidateCode}</h1>`
		const expTime = genMailValidateExpTime() // 过期时间
		// 先将6位验证码存入数据库
		let queryStr = `UPDATE users
						SET changeKey_validate='${mailValidateCode}',
						changeKey_exptime=${expTime}
						WHERE mail='${mail}'`
		getConnectionQuery(pool, queryStr, (err, results) => {
			if (err) {
				return callback(err)
			} else {
				if (results.changedRows === 0) { // 没有此邮箱信息
					return callback('没有此邮箱信息')
				} else { // 验证码已存入数据库，给用户发送验证码邮件
					sendMail(mail, subject, html, (err, re) => {
						if (err !== null) {
							return callback('发送失败')
						} else {
							return callback(null)
						}
					})
				}
			}
		})
	} catch (err) {
		return callback(err)
	}
}
//#endregion

exports.register = register
exports.mailValidate = mailValidate
exports.login = login
exports.forgetPassword = forgetPassword
exports.sendMailValidateCode = sendMailValidateCode