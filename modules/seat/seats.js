// 占座相关功能
const pool = require('../sql/conn')
const {
	getConnectionQuery
} = require('../sql/CRUD')

//#region 构建座位数组对象 数组长度为 11，初始化为[{status: false, username: ''}]
function initSeats() {
	let seatNumber = 11 // 座位数量
	let seatObj = {
		status: false,
		username: ''
	}
	let seats = []
	for (let i = 0; i < seatNumber; i++) {
		seats.push(seatObj)
	}
	return seats
}
//#endregion

//#region 获取当前座位信息
/**
 * 获取当前座位信息
 * @param {*} callback (err, seats) => {} err: err; seats: 数组 [{status: true or false, username: ''}]
 */
function getSeatsInfo(callback) {
	let seats = initSeats() // 获取初始化 座位信息 数组
	// 查询已占座用户
	let queryStr = `SELECT username,seatNumber FROM users WHERE seatNumber != 0`
	getConnectionQuery(pool, queryStr, (err, results) => {
		if (err) {
			return callback(err, seats)
		} else {
			if (results.length === 0) { // 没有人占座
				return callback(null, seats)
			} else {
				results.forEach((item, index) => {
					seats[item.seatNumber - 1] = {
						status: true,
						username: item.username
					}
				})
				return callback(null, seats)
			}
		}
	})
}
//#endregion

//#region 用户点击占座 的处理函数
/**
 * 用户点击占座 的处理函数
 * @param {*} seatNumber 座位号
 * @param {*} mail 用户邮箱
 * @param {*} callback 回调 (err, result) => {} err: err; result: 'success' or 'defeat'
 */
function reverseSeat(seatNumber, mail, callback) {
	if (seatNumber <= 0) {
		return callback('座位号错误', 'defeat')
	} else if (mail === undefined) {
		return callback('session中没有此邮箱信息', 'defeat')
	} else {
		// 查询此座位是否被占
		let queryStr = `SELECT username,mail FROM users WHERE seatNumber=${seatNumber}`
		getConnectionQuery(pool, queryStr, (err, results) => {
			if (err) {
				return callback(err, 'defeat')
			} else {
				if (results.length !== 0) { // 已被占
					return callback('此座位不可被占座，因为已经被占了😥', 'defeat')
				} else { // 可以占座

					// 查询此用户是否已经占座
					let queryStr1 = `SELECT seatNumber FROM users WHERE mail='${mail}'`
					getConnectionQuery(pool, queryStr1, (err, results) => {
						if (err) {
							return callback(err, 'defeat')
						} else {
							if (results[0].seatNumber !== 0) {
								return callback('你已经占座了，不能重复占座', 'defeat')
							} else {
								// 更新记录
								let queryStr2 = `UPDATE users SET seatNumber=${seatNumber} WHERE mail='${mail}'`
								getConnectionQuery(pool, queryStr2, (err, results) => {
									if (err) {
										return callback(err, 'defeat')
									} else {
										if (results.changedRows !== 1) {
											return callback('没有此邮箱用户信息，占座失败', 'defeat')
										} else {
											return callback(null, 'success')
										}
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
//#endregion


//#region 获取当前用户占座状态
/**
 * 获取当前用户占座状态
 * @param {*} mail 用户邮箱
 * @param {*} callback 回调 (err, result) => {} err: err or null; result: 座位号 or null or 未占座
 */
function getLocalUserSeatStatus(mail, callback) {
	if (mail === undefined) {
		return callback('没有此邮箱用户信息', null)
	}
	let queryStr = `SELECT seatNumber FROM users WHERE mail='${mail}'`
	getConnectionQuery(pool, queryStr, (err, results) => {
		// console.log(results[0].seatNumber)
		if (err) {
			return callback('查询用户占座信息失败', null)
		} else {
			if (results[0].seatNumber !== 0) { // 已占座
				return callback(null, results[0].seatNumber)
			}
			else {
				return callback(null, '未占座')
			}
		}
	})
}
//#endregion

//#region 离开座位功能
/**
 * 离开座位功能
 * @param {*} mail 邮箱
 * @param {*} callback 回调 err => {} err= err or null
 */
function leaveSeat(mail, callback) {
	if (mail === undefined) {
		return callback('没有此邮箱信息')
	}
	// 更新记录
	let queryStr = `UPDATE users SET seatNumber=0 WHERE mail='${mail}' AND seatNumber != 0`
	getConnectionQuery(pool, queryStr, (err, results) => {
		// console.log(results[0].seatNumber)
		if (err) {
			return callback(err)
		} else {
			if (results.changedRows === 0) { // 没有记录被更新
				return callback('你未占座') // 也有可能表中没有此邮箱记录
			}
			else if (results.changedRows === 1) { // 成功更新记录
				return callback(null)
			}
			else {
				return callback('虽然离开座位成功了，但是出现未知错误，请联系管理员')
			}
		}
	})
}
//#endregion

module.exports = {
	getSeatsInfo,
	reverseSeat,
	getLocalUserSeatStatus,
	leaveSeat
}