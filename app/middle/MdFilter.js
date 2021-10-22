const Stint = require('../config/stint.js');
const bcrypt = require('bcryptjs');

exports.UserPwdBcrypt_FilterProm = (pwd) => {
	return new Promise((resolve, reject) => {
		if(!pwd) reject('请您输入密码');
		pwd = pwd.replace(/^\s*/g,"");
		if(pwd.length < Stint.extent.User.pwd.min || pwd.length > Stint.extent.User.pwd.max) {
			reject('密码长度至少是'+Stint.extent.User.pwd.min+'个字符 最多是'+Stint.extent.User.pwd.max+'个字符');
		} else {
			bcrypt.genSalt(parseInt(process.env.SALT_WORK_FACTOR), function(err, salt) {
				if(err) {
					reject('bcrypt.genSalt error!');
				} else {
					bcrypt.hash(pwd, salt, function(err, password) {
						if(err) {
							reject('bcrypt.hash error!');
						} else {
							resolve(password);
						}
					});
				}
			});
		}
	})
}

exports.UserCode_FilterProm = (code) => {
	return new Promise((resolve, reject) => {
		if(!code) reject('请您输入成员账号');
		code = code.replace(/^\s*/g,"").toUpperCase();
		const regexp = new RegExp(Stint.extent.User.code.regexp);
		if(!regexp.test(code)) {
			reject('账号只能由字母组成');
		} else if(code.length < Stint.extent.User.code.min || code.length > Stint.extent.User.code.max) {
			reject('用户帐号长度至少是'+Stint.extent.User.code.min+'个字符 最多是'+Stint.extent.User.code.max+'个字符');
		} else {
			resolve(code)
		}
	})
}

exports.page_Filter = (req, pagesize=50) => {
	let page = 1;
	if(req.query.page && !isNaN(parseInt(req.query.page))) {
		page = parseInt(req.query.page);
	}

	if(req.query.pagesize && !isNaN(parseInt(req.query.pagesize))) {
		pagesize = parseInt(req.query.pagesize);
	}
	const skip = (page-1)*pagesize;
	return {page, pagesize, skip};
}