//#region 封装异步 连接池执行query操作
/**
 *
 * @param {*} pool 连接池
 * @param {*} query 查询参数
 * @param {*} callback 回调 (err, results)
 */
function getConnectionQuery(pool, query, callback) {
	pool.getConnection(function (err, connection) {
		if (err) {
			callback(err)
		}
		connection.query(query, function (error, results, fields) {
			connection.release();

			// Handle error after the release.
			if (error) {
				callback(error)
			} else {
				callback(null, results)
			}
			// Don't use the connection here, it has been returned to the pool.
		});

	});
}
// 使用方式
// getConnectionQuery(pool, queryStr, (err, results) => {
// 	if (err) {
// 		console.log(err)
// 	}
// 	else {
// 		console.log(results)
// 	}
// })
//#endregion


//#region 连接池

//#endregion

exports.getConnectionQuery = getConnectionQuery