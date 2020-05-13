// 权限相关功能模块
const pool = require('../sql/conn')
const {
	getConnectionQuery
} = require('../sql/CRUD')


/**
 * 获取所有用户信息 构造用户信息列表
 * @param {*} callback 回调 (err, data) => {} err= err or null; data= 用户信息列表 {[username, mail, admin]}
 */
function getUserInfoList(callback) {
	// 所有已激活用户 按照 admin 降序排列
	let queryStr = `SELECT username, mail, admin FROM users WHERE active_status=1 AND admin != 2 ORDER BY admin  DESC`
	getConnectionQuery(pool, queryStr, (err, results) => {
		if (err) {
			return callback(err)
		} else {
			if (results.length === 0) { // 没有结果
				return callback('没有结果')
			}
			else {
				return callback(null, results)
			}
		}
	})
}

/**
 * 授权功能模块
 * @param {*} body 传过来的 username、mail、admin
 * @param {*} callback 回调 err => {}
 */
function getAdmin(body, callback) {
	const { username, mail, admin } = body
	// console.log(username, mail, admin)
	if (username === '' || mail === '' || admin === '') {
		return callback('提交用户信息有空')
	}
	else if (admin === 1) {
		return callback('此用户拥有权限，不需要授权')
	}
	else {
		let queryStr = `UPDATE users SET admin=1 WHERE username='${username}' AND mail='${mail}' AND admin=${admin}`
		getConnectionQuery(pool, queryStr, (err, results) => {
			if (err) {
				return callback(err)
			} else {
				if (results.changedRows === 0) {
					return callback('此用户已被授权') // 或未查到此用户信息
				}
				else {
					return callback(null)
				}
			}
		})
	}
}

/**
 * 取消用户权限
 * @param {*} body 传过来的 username、mail、admin
 * @param {*} callback callback 回调 err => {}
 */
function cancelAdmin(body, callback) {
	const { username, mail, admin } = body
	// console.log(username, mail, admin)
	if (username === '' || mail === '' || admin === '') {
		return callback('提交用户信息有空')
	}
	else if (admin === 0) {
		return callback('此用户没有权限，不需要取消授权')
	}
	else {
		let queryStr = `UPDATE users SET admin=0 WHERE username='${username}' AND mail='${mail}' AND admin=${admin}`
		getConnectionQuery(pool, queryStr, (err, results) => {
			if (err) {
				return callback(err)
			} else {
				if (results.changedRows === 0) {
					return callback('此用户没有权限') // 或未查到此用户信息
				}
				else {
					return callback(null)
				}
			}
		})
	}
}


module.exports = {
	getUserInfoList,
	getAdmin,
	cancelAdmin
}
