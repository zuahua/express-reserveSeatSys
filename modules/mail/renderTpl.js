var template = require('art-template')
const { link } = require('../const/link')

/**
 * 渲染注册邮箱验证页面
 * @param {*} url 验证链接
 */

function renderValidatePage(token, mail) {
	// 构建链接
	const url = link + `mailValidate?token=${token}&mail=${mail}`
	var html = template(__dirname + '/validate.html', {
		url: url
	});
	return html
}

// console.log(renderValidatePage('xxxxxxx'));

module.exports = { renderValidatePage }