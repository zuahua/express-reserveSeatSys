// 授权相关路由

const express = require('express')
const router = express.Router()

const {
	getLoginStatus
} = require('../modules/login-register/login-status') // 获取登陆状态

const {
	getUserAdmin
} = require('../modules/meeting/meetingModule.js') // 获取用户权限

const {getUserInfoList, getAdmin, cancelAdmin} = require('../modules/admin/adminModule') // 授权功能：获取所有用户信息、授权、取消授权

// 授权页面
router.get('/getadmin', function (req, res, next) {
	let status = getLoginStatus(req.session)
	// 获取用户权限
	getUserAdmin(req.session.mail, (err, admin) => {
		if (err) {
			res.render('admin.html', {
				status,
				username: req.session.username,
				admin: 0, // 开会权限
			})
		} else {
			getUserInfoList((err, data) => {
				if (err) { // 出现错误
					// console.log(err)
					res.render('admin.html', {
						status,
						username: req.session.username,
						admin // 开会权限
					})
				}
				else {
					// console.log(data)
					res.render('admin.html', {
						status,
						username: req.session.username,
						admin, // 开会权限
						userInfoList: data
					})
				}
			})
		}
	})
});

// 授权 post 请求
router.post('/getadmin', function (req, res, next) {
	getAdmin(req.body, (err) => {
		if (err) {
			res.send(err)
		}
		else {
			res.send(null)
		}
	})
});

// 取消授权功能 请求
router.post('/cancelAdmin', function (req, res, next) {
	cancelAdmin(req.body, err => {
		if (err) {
			res.send(er)
		}
		else {
			res.send(null)
		}
	})
});


module.exports = router