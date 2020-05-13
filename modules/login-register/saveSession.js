/**
 * 登陆时保存用户 用户名、邮箱 到session
 * @param {*} session 
 * @param {*} username 
 * @param {*} mail 
 */
function saveSession(session, username, mail) {
	session.username = username
	session.mail = mail
}

module.exports = saveSession