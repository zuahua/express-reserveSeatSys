// 开会相关的 router //

const express = require('express')
const router = express.Router()

const {
	getLoginStatus
} = require('../modules/login-register/login-status') // 获取登陆状态

const { meetingCall, getUserAdmin } = require('../modules/meeting/meetingModule.js') // 开会功能相关,获取用户权限

//#region 1. 开会页面 路由
router.get('/meeting', (req, res) => {
	let loginStatus = getLoginStatus(req.session)
	getUserAdmin(req.session.mail, (err, admin) => {
		if (err) {
			res.render('meeting.html', {
				status: loginStatus,
				username: req.session.username,
				admin: 0 // 开会权限
			})
		}
		else {
			// console.log(admin)
			res.render('meeting.html', {
				status: loginStatus,
				username: req.session.username,
				admin // 开会权限
			})
		}
	})
})
//#endregion

//#region 2. 发布开会通知 POST
router.post('/meeting', (req, res) => {
	meetingCall(req.session.mail, req.body.meetingCall, err => {
		if (err) {
			res.render('../modules/meeting/result.html', {
				meetingCallStatus: false,
				err
			})
		}
		else {
			res.render('../modules/meeting/result.html', {
				meetingCallStatus: true
			})
		}
	})
})
//#endregion

module.exports = router