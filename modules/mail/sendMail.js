const nodemailer = require("nodemailer")
const { mailAddress, mailPassword } = require("../const/password")

const transporter = nodemailer.createTransport({
	host: "smtp.163.com",
	port: 465,
	secureConnection: true,
	auth: {
		user: mailAddress,
		pass: mailPassword
	}
});

/**
 * 发送邮件功能
 * @param {*} to 接收人
 * @param {*} subject 标题
 * @param {*} html 内容
 * @param {*} callback 回调 (err, re) => {}
 */
function sendMail(to, subject, html, callback) {
	let mailOptions = {
		from: '占座系统 <innozh@163.com>', // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		html: html // html body
	}
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			callback(error)
		}
		else {
			callback(null, '发送成功')
		}
		// console.log('Message sent: %s', info.messageId);
		// Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
	});
}

// 调用
// sendMail('1985857412@qq.com', 'HELLO', 'hello you', (err, re) => {
// 	if (err !== null) {
// 		console.log('发送失败')
// 	}
// 	else {
// 		console.log('发送成功')
// 	}
// })

module.exports = sendMail