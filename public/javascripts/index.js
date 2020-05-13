// index.html 控制JS

$(function () {
	//#region 1--- 导航头部的 active 根据 url、search 显示
	const search = window.location.search
	let searchObj = new URLSearchParams(search)
	let page = searchObj.get('status')
	let pathname = location.pathname
	// 按照 li 的顺序添加 active
	if (page === 'register') {
		$('#registerLi').addClass('active').siblings('li').removeClass('active')
	}
	else if (page === 'login') {
		$('#loginLi').addClass('active').siblings('li').removeClass('active')
	}
	else if (page === 'forget') {
		$('#headerNav>li').removeClass('active')
	}
	// 按照 pathname 的开头判断
	else if (pathname === '/') {
		$('#mainPageLi').addClass('active').siblings('li').removeClass('active')
	}
	else if (pathname.match(/^\/about/)) {
		$('#aboutLi').addClass('active').siblings('li').removeClass('active')
	}
	else if (pathname.match(/^\/reserveseat/)) {
		$('#reserveSeatLi').addClass('active').siblings('li').removeClass('active')
	}
	else if (pathname.match(/^\/meeting/)) {
		$('#meetingLi').addClass('active').siblings('li').removeClass('active')
	}
	else if (pathname.match(/^\/reserveseat/)) {
		$('#reserveSeat').addClass('active').siblings('li').removeClass('active')
	}
	else if (pathname.match(/^\/getadmin/)) {
		$('#getAdmin').addClass('active').siblings('li').removeClass('active')
	}
	else { // 未知情况
		$('#headerNav>li').removeClass('active')
	}
	//#endregion

	//#region 2--- 控制不同屏幕大小时的导航显示
	if ($(window).width() < 768) {
		$('#headerNav').addClass('nav-stacked').removeClass('pull-right').removeClass('nav-pills')
	}
	//#endregion

	//#region  3---点击验证码刷新--- //
	$('img[alt="验证码"]').click(function () {
		let params = new URLSearchParams(location.search)
		let status = params.get('status') // 获取 状态：login、register、forget
		let random = Math.random() // 构造随机数
		$(this).attr('src', '/captcha?status=' + status + '&random=' + random)
	})
	//#endregion

	//#region  4--- 忘记密码页面 点击发送邮件的事件处理
	$('#sendMailForget').click(function () {
		let $currentBtn = $(this)
		// 获取提交信息
		const emailForget = $('#emailForget').val()
		const passwdForget = $('#passwdForget').val()
		const rePasswdForget = $('#rePasswdForget').val()
		const validateForget = $('#validateForget').val()
		if (emailForget === '' || passwdForget === '' || rePasswdForget === '') {
			alert('邮箱或密码有空')
		} else if (!emailForget.match(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)) { // 邮箱格式
			alert('邮箱格式不正确')
		} else if (emailForget.length > 20) { // 邮箱长度不能大于20位
			alert('邮箱长度不能大于20位')
		} else if (passwdForget.length < 6 || passwdForget.length > 20) { // 密码长度不能小于6位、大于20位
			alert('密码长度不能小于6位、大于20位')
		} else if (rePasswdForget !== passwdForget) { // 两次密码不一致
			alert('两次密码不一致')
		} else {
			$currentBtn.attr('disabled', 'disabled') // 避免连续多次点击

			$.get('/captchaForget', (validateCode) => { // 获取验证码
				if (validateForget.toLowerCase() !== validateCode.toLowerCase()) { // 图片验证码错误
					alert('图片验证码错误')
					$currentBtn.removeAttr('disabled')
				} else {
					// 发送邮件验证码用于重置密码
					$.post('/sendMailValidate', {
						mail: emailForget
					}, function (re) {
						if (re.result === true) {
							alert('发送成功')
							// 邮箱发送成功后，30s后才能再次发送
							$currentBtn.attr('disabled', 'disabled')
							let num = 30 // 30s
							let interval = setInterval(function () {
								$currentBtn.html(num + 's后重新发送')
								num = num - 1
							}, 1000)
							// 30s后 能够再次发送邮件 清除 interval
							setTimeout(function () {
								clearInterval(interval)
								$currentBtn.removeAttr('disabled')
								$currentBtn.html('发送邮件')
							}, (num + 1) * 1000)
						} else {
							alert(re.error)
							$currentBtn.removeAttr('disabled')
						}
					})
				}
			})
		}
	})
	//#endregion

	//#region 5 --- 根据 cookie 渲染登陆页面的用户名和密码
	let cookie = document.cookie.split(';')
	let usernameLogin
	let passwordLogin
	for (let i = 0; i < cookie.length; i++) {
		let key = cookie[i].trim().split('=')[0]
		if (key === 'usernameLogin') {
			usernameLogin = cookie[i].trim().split('=')[1]
		}
		else if (key === 'passwordLogin') {
			passwordLogin = cookie[i].trim().split('=')[1]
		}
	}
	if (usernameLogin !== undefined && passwordLogin !== undefined) {
		$('#usernameLogin').val(usernameLogin)
		// 密码解码
		passwordLogin = atob(passwordLogin)
		// console.log(passwordLogin)
		$('#passwdLogin').val(passwordLogin)
	}
	//#endregion

	//#region 6 --- 用户信息 点击 修改用户名 控制编辑状态与提交按钮状态
	let username
	$('#aTagModify').click(function () { // 点击修改
		username = $('#usernameModify').val()
		$('#usernameModify').removeAttr('disabled') // 可编辑
		$('#aTagCancleModify').removeAttr('style') // 显示 撤销按钮
		$('#confirmModifyBtn').removeAttr('disabled') // 确认按钮 可点击
	})
	$('#aTagCancleModify').click(function() { // 点击撤销
		$('#usernameModify').val(username)
		$('#usernameModify').attr('disabled', 'disabled') // 不可编辑
		$('#aTagCancleModify').attr('style', 'display: none') // 撤销不显示
		$('#confirmModifyBtn').attr('disabled', 'disabled') // 确认按钮 不可点击
	})
	//#endregion
})