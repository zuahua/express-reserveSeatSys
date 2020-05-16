// 开会相关的功能函数模块

const pool = require('../sql/conn')
const {
	getConnectionQuery
} = require('../sql/CRUD')

const sendMail = require('../mail/sendMail') // 发送邮件

//#region 发布开会通知
/**
 * 发布开会通知
 * @param {*} mail 发布人邮箱
 * @param {*} content 发布内容
 * @param {*} callback 回调 err => {} err: err or null
 */
function meetingCall(mail, content, callback) {
	try {
		if (mail === undefined) {
			return callback('没有你的邮箱用户信息')
		} else if (content === '') {
			return callback('发布内容为空')
		} else if (content.length < 6) {
			return callback('内容不少于6个字')
		} else {
			// 查找所有激活账户
			let queryStr = `SELECT mail FROM users WHERE active_status=1`
			getConnectionQuery(pool, queryStr, (err, results) => {
				if (err) {
					return callback(err)
				} else {
					if (results.length === 0) {
						return callback('没有用户')
					} else {
						callback(null)
						// 发送邮件
						let subject = '占座系统开会通知'
						let html = `<h4>${content}</h4>`
						results.forEach(function (item) {
							let mail = item.mail
							sendMail(mail, subject, html)
						})
					}
				}
			})
		}
	} catch (err) {
		return callback(err)
	}
}
//#endregion


//#region 获取用户权限
/**
 * 获取用户权限
 * @param {*} mail 邮箱
 * @param {*} callback 回调 (err, admin) => {} err= err or null; admin: 用户权限
 */
function getUserAdmin(mail, callback) {
	if (mail === undefined) {
		return callback('没有你的邮箱用户信息')
	} else {
		let queryStr = `SELECT admin FROM users WHERE mail='${mail}'`
		getConnectionQuery(pool, queryStr, (err, results) => {
			if (err) {
				return callback(err)
			} else {
				if (results.length === 0) {
					return callback('没有用户')
				} else if (results.length === 1) {
					return callback(null, results[0].admin)
				} else {
					return callback('查询到多条用户信息')
				}
			}
		})
	}
}
//#endregion

module.exports = {
	meetingCall,
	getUserAdmin
}