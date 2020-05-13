// 占座相关的 router //

const express = require('express')
const router = express.Router()

const {
	getLoginStatus
} = require('../modules/login-register/login-status') // 获取登陆状态

const {
	getSeatsInfo,
	reverseSeat,
	getLocalUserSeatStatus,
	leaveSeat
} = require('../modules/seat/seats.js') // 引入占座相关功能

const {
	getUserAdmin
} = require('../modules/meeting/meetingModule.js') // 获取用户权限

//#region 1. 占座页面 router
router.get('/reserveseat', (req, res) => {
	let status = getLoginStatus(req.session)
	getSeatsInfo((err, seats) => {
		if (err) {
			res.render('seats.html', {
				status: loginStatus,
				username: req.session.username,
				seats
			})
		} else {
			// 获取用户权限
			getUserAdmin(req.session.mail, (err, admin) => {
				if (err) {
					res.render('seats.html', {
						status,
						username: req.session.username,
						seats,
						admin: 0 // 开会权限
					})
				} else {
					// console.log(admin)
					res.render('seats.html', {
						status,
						username: req.session.username,
						seats,
						admin // 开会权限
					})
				}
			})
		}
	})
})
//#endregion

//#region 2. 点击占座的 post 处理
router.post('/reserveseat', (req, res) => {
	reverseSeat(req.body.seatNumber, req.session.mail, (err, re) => {
		if (err) {
			res.send({
				err,
				result: re
			})
		} else {
			res.send({
				err: null,
				result: re
			})
		}
	})
})
//#endregion

//#region 3. 获取当前用户占座状态的router
router.get('/getLocalUserSeatStatus', (req, res) => {
	getLocalUserSeatStatus(req.session.mail, (err, result) => {
		if (err) {
			res.send({
				seatStatus: '未知',
				err
			})
		} else {
			res.send({
				seatStatus: result,
				err: null
			})
		}
	})
})
//#endregion

//#region 4. 离开座位 路由
router.get('/leaveseat', (req, res) => {
	leaveSeat(req.session.mail, (err) => {
		if (err) {
			res.send({
				status: false,
				err
			})
		} else {
			res.send({
				status: true,
				err: null
			})
		}
	})
})
//#endregion

module.exports = router