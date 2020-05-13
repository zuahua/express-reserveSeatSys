const mysql = require('mysql')
const { sqlPassword } = require('../const/password')

const connParams = {
	host: 'localhost',
	user: 'root',
	password: sqlPassword,
	database: 'express',
	multipleStatements: true // 支持多个查询语句
}

// 创建连接
const pool = mysql.createPool(connParams)

module.exports = pool