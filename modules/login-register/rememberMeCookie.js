//#region 用户登录时 点击 记住我 保存用户信息session
/**
 * 用户登录时 点击 记住我 保存用户信息session
 * @param {*} rememberMeLogin :未选中复选框 undefined 选中：'记住我'
 * @param {*} res 使用 res.cookie 保存用户 cookie
 * @param {*} usernameLogin 登录用户名
 * @param {*} passwordLogin 登陆密码
 */
function saveRememberMeCookie(rememberMeLogin, res, usernameLogin, passwordLogin) {
	if (rememberMeLogin === '记住我') {
		let maxAge = 7 * 24 * 60 * 60 * 1000
		res.cookie('usernameLogin', usernameLogin, { maxAge: maxAge, httpOnly: false })
		/* 这里使用 base64对密码编码 */
		let passwordBase64 = Buffer.from(passwordLogin, 'utf8').toString('base64')
		res.cookie('passwordLogin', passwordBase64, { maxAge: maxAge, httpOnly: false })
	}
	// console.log(rememberMeLogin, usernameLogin, passwordLogin);
}

//#endregion

// let passwordBase64 = Buffer.from('asakjsh986876', 'utf8').toString('base64')
// console.log(passwordBase64)

module.exports = saveRememberMeCookie