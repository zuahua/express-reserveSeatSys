// 占座相关 DOM
$(function () {
	// 点击座位进行占座 的事件处理 DOM
	$('button[name="seat"]').click(function (e) {
		var confirm = window.confirm('确定占座吗？😊')
		if (confirm) {
			const seatNumber = $(this).attr('seatNumber') // 获取座位号
			$.post('/reserveseat', { seatNumber }, (re) => {
				const { err, result } = re
				if (err) {
					alert(err)
				}
				else {
					alert('占座成功')
					// 刷新页面
					window.location.href = '/reserveseat'
				}
			})
		}
		else {

		}
	})

	// 获取当前用户占座状态的DOM操作
	$.get('/getLocalUserSeatStatus', function(result) {
		let seatStatus = result.seatStatus // 未知、座位号、null、未占座
		if (typeof(seatStatus) === 'number') {
			seatStatus = '已占 ' + seatStatus + ' 号座位'
		}
		$('#localUserSeatStatus').html(seatStatus)
	})

	// 点击离开座位的DOM操作
	$('#leaveSeat').click(function() {
		let confirm = window.confirm('确认离开吗？😭')
		if (confirm) {
			$.get('/leaveseat', (result) => {
				let { status, err } = result
				if (status) { // 离开座位成功
					// alert('离开座位成功')
					// 刷新页面
					window.location.href = '/reserveseat'
				}
				else {
					alert('失败')
					window.location.href = '/reserveseat'
				}
			})
		}
	})
})