// 登录、注册、忘记密码渲染结果模板

var template = require('art-template')
/**
 * 登录、注册、忘记密码渲染结果模板
 * @param {*} result ：success error
 * @param {*} status : login(登录) register(注册) forget(提交)
 * @param {*} error
 */
function renderResultPage(result, status, error) {
	let html = template(__dirname + '/result.html', {
		result,
		status,
		error
	})
	return html
}

module.exports = renderResultPage

// console.log(renderResultPage('success', '注册', ''))