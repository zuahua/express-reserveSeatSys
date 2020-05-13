// 判断用户是否为登录用户 session.username

/**
 * 获取 session.username 判断用户是否为登录用户
 * @param {*} session 参数
 * 返回值：string类型 hasLogin(已登录) noLogin(未登录)
 */
function getLoginStatus(session) {
	let username = session.username
	if (username) { // 已登录
		return 'hasLogin'
	}
	else {
		return 'noLogin'
	}
}

module.exports = {
	getLoginStatus
}