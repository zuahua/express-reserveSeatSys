// 用户信息修改的功能函数

const pool = require('../sql/conn')
const {
	getConnectionQuery
} = require('../sql/CRUD')
const sendMail = require('../mail/sendMail') // 发送邮件

const {
	encrypt,
	verify
} = require('../crypto/crypto')

//#region 修改用户名
/**
 * 修改用户名
 * @param {*} body post过来的数据
 * @param {*} mail 邮箱
 * @param {*} callback 回调 err => {} err: Error or null
 */
function usernameChange(body, mail, callback) {
	const { usernameModify } = body
	// console.log(usernameModify, mail)
	if (usernameModify === '') {
		return callback('提交信息有空')
	}
	else if (mail === undefined) {
		return callback('邮箱信息为 undefined，未知错误，请联系管理员')
	}
	// 查询此用户名
	let queryStr = `SELECT username,mail FROM users WHERE username='${usernameModify}'`
	getConnectionQuery(pool, queryStr, (err, results) => {
		if (err) {
			return callback(err)
		} else {
			if (results.length === 1) { // 查到一条记录
				if (results[0].mail === mail) { // 此条记录为它自己
					return callback('你未修改')
				}
				else {
					return callback('此用户名已被使用')
				}
			}
			else if (results.length > 1) { // 查到多条记录
				return callback('查询到多条相同用户名，未知错误，请与管理员联系')
			}
			else { // 没查到 此用户名可用 更新用户名
				let queryStr1 = `UPDATE users SET username='${usernameModify}' WHERE mail='${mail}'`
				getConnectionQuery(pool, queryStr1, (err, results) => {
					if (err) {
						return callback(err)
					} else {
						if (results.changedRows === 0) { // 未更新成功 没有此邮箱信息
							return callback('没有此邮箱用户信息')
						}
						else { // 更新成功
							return callback(null)
						}
					}
				})
			}
		}
	})
}
//#endregion


//#region 修改密码
/**
 * 修改密码
 * @param {*} body post 参数
 * @param {*} mail 邮箱
 * @param {*} callback 回调 callback 回调 err => {} err: Error or null
 */
function passwordChange(body, mail, callback) {
	const { oldPassword, newPassword, reNewPassword } = body
	// console.log(oldPassword, newPassword, reNewPassword, mail)
	if (oldPassword === '' || newPassword === '' || reNewPassword === '') {
		return callback('提交信息有空')
	}
	else if (mail === undefined) {
		return callback('邮箱信息为 undefined，未知错误，请联系管理员')
	}
	else if (oldPassword.length < 6 || newPassword.length < 6 || reNewPassword < 6) {
		return callback('密码长度必须大于6')
	}
	else if (newPassword === oldPassword) {
		return callback('你未修改密码')
	}
	else if (newPassword !== reNewPassword) {
		return callback('两次密码不一致')
	}
	else {
		let queryStr = `SELECT username,password FROM users WHERE mail='${mail}'`
		getConnectionQuery(pool, queryStr, (err, results) => {
			if (err) {
				return callback(err)
			} else {
				if (results.length === 0) { // 没有此邮箱用户信息
					return callback('没有此邮箱用户信息')
				}
				else if (results.length > 1) {
					return callback('此邮箱用户有多个，请联系管理员')
				}
				else if (results.length === 1) { // 查到一条记录
					let passwordSearched = results[0].password
					let newHmac = encrypt(newPassword) // 密码加密
					let oldHmac = encrypt(oldPassword)
					if (passwordSearched !== oldHmac) {
						return callback('原密码不正确')
					}
					else {
						let queryStr1 = `UPDATE users SET password='${newHmac}' WHERE mail='${mail}'`
						getConnectionQuery(pool, queryStr1, (err, results) => {
							if (err) {
								return callback(err)
							} else {
								if (results.changedRows === 0) { // 未更新成功 没有此邮箱信息
									return callback('没有此邮箱用户信息')
								}
								else { // 更新成功
									return callback(null)
								}
							}
						})
					}
				}
			}
		})
	}
}

//#endregion
module.exports = {
	usernameChange,
	passwordChange
}