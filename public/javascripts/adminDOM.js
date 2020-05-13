$(function() {
	// 点击授权按钮
	$('button[name="getAdmin"]').click(function() {
		let username = $(this).parent().siblings('td[name="username"]').html()
		let mail = $(this).parent().siblings('td[name="mail"]').html()
		let admin = $(this).parent().siblings('td[name="admin"]').html()

		$.post('/getadmin', {
			username,
			mail,
			admin
		}, function(err) {
			if (err) {
				alert(err)
				window.location.href = '/getadmin'
			}
			else {
				alert('授权成功')
				window.location.href = '/getadmin'
			}
		})
	})

	// 点击取消授权
	$('button[name="cancelAdmin"]').click(function() {
		let username = $(this).parent().siblings('td[name="username"]').html()
		let mail = $(this).parent().siblings('td[name="mail"]').html()
		let admin = $(this).parent().siblings('td[name="admin"]').html()

		$.post('/cancelAdmin', {
			username,
			mail,
			admin
		}, function(err) {
			if (err) {
				alert(err)
				window.location.href = '/getadmin'
			}
			else {
				alert('取消授权成功')
				window.location.href = '/getadmin'
			}
		})
	})
})