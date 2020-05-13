var express = require('express')
var router = express.Router()
var svgCaptcha = require('svg-captcha') // 验证码
let loginRegister = require('../modules/login-register/login-register.js')
const renderResultPage = require('../modules/login-register/result-handle') // 渲染登陆注册结果

const {
  getLoginStatus
} = require('../modules/login-register/login-status') // 获取登陆状态

const saveRememberMeCookie = require('../modules/login-register/rememberMeCookie.js')

const {
  usernameChange,
  passwordChange
} = require('../modules/userinfo/userinfoChange.js') // 用户信息修改

const {
  getUserAdmin
} = require('../modules/meeting/meetingModule.js') // 获取用户权限

//#region 1. / 主页
/* GET home page. */
router.get('/', function (req, res, next) {
  let status = getLoginStatus(req.session)
  // 获取用户权限
  getUserAdmin(req.session.mail, (err, admin) => {
    if (err) {
      res.render('index.html', {
        status,
        username: req.session.username,
        admin: 0 // 开会权限
      })
    } else {
      // console.log(admin)
      res.render('index.html', {
        status,
        username: req.session.username,
        admin // 开会权限
      })
    }
  })
})
//#endregion

//#region 2. /login-register 登录注册页面
router.get('/login-register', function (req, res, next) {
  res.render('login-register.html', {
    status: 'noLogin'
  })
})
//#endregion

//#region 3. /captcha 请求验证码
router.get('/captcha', function (req, res, next) {
  const captcha = svgCaptcha.create({
    size: 4,
    ignoreChars: '0o1i',
    noise: 0,
    color: true,
    background: '#faff72',
    fontSize: 30,
    height: 22
  })
  let status = req.query.status
  // 保存到 session
  if (status === 'login') {
    req.session.captchaLogin = captcha.text
  } else if (status === 'register') {
    req.session.captchaRegister = captcha.text
  } else if (status === 'forget') {
    req.session.captchaForget = captcha.text
  }

  res.type('svg')
  res.status(200).send(captcha.data)

  // console.log(req.session.captcha)
  // console.log(captcha.data)
})
//#endregion

//#region 4. /captchaForget 请求忘记密码页面的验证码
router.get('/captchaForget', function (req, res, next) {
  res.send(req.session.captchaForget)
})
//#endregion

//#region 5. /sendMailValidate 重置密码时 发送邮件验证码
router.post('/sendMailValidate', function (req, res, next) {
  loginRegister.sendMailValidateCode(req.body.mail, (err) => {
    if (err) {
      res.send({
        result: false,
        error: err
      })
    } else {
      res.send({
        result: true
      })
    }
  })
})
//#endregion

//#region 6. /register 注册提交
router.post('/register', function (req, res, next) {
  loginRegister.register(req.session, req.body, function (err) {
    if (err) {
      let html = renderResultPage('error', '注册', err)
      // console.log(err)
      return res.send(html)
    } else {
      let html = renderResultPage('success', '注册', '')
      return res.send(html)
    }
  })
})
//#endregion

//#region 7. /login 登录提交
router.post('/login', function (req, res, next) {
  loginRegister.login(req.session, req.body, (err) => {
    if (err) {
      // console.log(err)
      return res.render('../modules/login-register/result.html', {
        result: 'error',
        status: '登录',
        error: err
      })
    } else {
      // console.log('成功')
      // 调用"记住我" 保存 cookie 函数
      saveRememberMeCookie(req.body.rememberMeLogin, res, req.body.usernameLogin, req.body.passwdLogin)

      return res.render('../modules/login-register/result.html', {
        result: 'success',
        status: '登录',
        error: null
      })
    }
  })
})
//#endregion

//#region 8. /forget 忘记密码 路由控制
router.post('/forget', function (req, res, next) {
  loginRegister.forgetPassword(req.session, req.body, (err) => {
    if (err) {
      // console.log(err)
      return res.render('../modules/login-register/result.html', {
        result: 'error',
        status: '重置密码',
        error: err
      })
    } else {
      // console.log('成功')
      return res.render('../modules/login-register/result.html', {
        result: 'success',
        status: '重置密码',
        error: null
      })
    }
  })
})
//#endregion

//#region 9. /mailValidate 注册的邮箱验证
router.get('/mailValidate', function (req, res, next) {
  loginRegister.mailValidate(req.query, (err) => {
    if (err) {
      // console.log(err)
      return res.render('../modules/login-register/result-validate.html', {
        result: err
      })
    } else {
      // console.log('验证成功')
      return res.render('../modules/login-register/result-validate.html', {
        result: '验证成功'
      })
    }
  })
})
//#endregion

//#region 10. /logout 注销
router.get('/logout', function (req, res, next) {
  req.session.destroy()
  res.redirect('/')
  // console.log(req.session.username)
})
//#endregion

//#region 11. /userinfo 用户信息页面
router.get('/userinfo', function (req, res, next) {
  getUserAdmin(req.session.mail, (err, admin) => {
    if (err) {
      res.render('userinfo.html', {
        status: 'hasLogin',
        username: req.session.username,
        admin: 0 // 开会权限
      })
    } else {
      // console.log(admin)
      res.render('userinfo.html', {
        status: 'hasLogin',
        username: req.session.username,
        admin // 开会权限
      })
    }
  })
})
//#endregion

//#region 12. /userinfo-changeusername 修改用户名
router.post('/userinfo-changeusername', function (req, res, next) {
  usernameChange(req.body, req.session.mail, function (err) {
    if (err) {
      // console.log(err)
      res.render('../modules/userinfo/result.html', {
        pageStatus: 'usernameChange',
        changeResult: 'defeat',
        err: err
      })
    } else {
      // console.log('成功')
      req.session.destroy() // 清除session
      res.render('../modules/userinfo/result.html', {
        pageStatus: 'usernameChange',
        changeResult: 'success',
        err: null
      })
    }
  })
})
//#endregion

//#region 13. /userinfo-changepassword 修改密码
router.post('/userinfo-changepassword', function (req, res, next) {
  passwordChange(req.body, req.session.mail, function (err) {
    if (err) {
      // console.log(err)
      res.render('../modules/userinfo/result.html', {
        pageStatus: 'passwordChange',
        changeResult: 'defeat',
        err: err
      })
    } else {
      // console.log('成功')
      res.render('../modules/userinfo/result.html', {
        pageStatus: 'passwordChange',
        changeResult: 'success',
        err: null
      })
    }
  })
})
//#endregion


//#region 关于页面的路由
router.get('/about', function (req, res, next) {
  let status = getLoginStatus(req.session)
  // 获取用户权限
  getUserAdmin(req.session.mail, (err, admin) => {
    if (err) {
      res.render('about.html', {
        status,
        username: req.session.username,
        admin: 0 // 开会权限
      })
    } else {
      // console.log(admin)
      res.render('about.html', {
        status,
        username: req.session.username,
        admin // 开会权限
      })
    }
  })
})
//#endregion

module.exports = router