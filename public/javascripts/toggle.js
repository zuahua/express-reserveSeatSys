/**
 * 功能：登录、注册、忘记密码 组件 切换
 */

$(function () {
	let url = new URL(window.location);
	let status = url.searchParams.get('status');
	// console.log(status);
	if(status === "login") {
		// console.log('ok')
		$('#registerForm').hide();
		$('#forgetForm').hide();
		$('#loginForm').slideDown();
	}
	else if(status === "register") {
		$('#forgetForm').hide();
		$('#loginForm').hide();
		$('#registerForm').slideDown();
	}
	else if(status === "forget") {
		$('#loginForm').hide();
		$('#registerForm').hide();
		$('#forgetForm').slideDown();
	}
});