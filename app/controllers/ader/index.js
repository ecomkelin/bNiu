const AderDB = require('../../models/login/Ader');
const bcrypt = require('bcryptjs');

exports.aderHome = (req, res) => {
	// console.log("/aderHome");
	try {
		if(!req.session.crAder) {
			res.redirect('/aderLogin');
		} else {
			res.render('./ader/index/index', {
				title: '平台管理',
				crAder : req.session.crAder,
			});
		}
	} catch(error) {
		return res.redirect('/error?info=aderHome,Error&error='+error);
	}
};

exports.aderLogin = (req, res) => {
	// console.log("/aderLogin");
	try {
		res.render('./ader/index/login', {
			title: 'Adminnistrator Login'
		});
	} catch(error) {
		return res.redirect('/error?info=aderLogin,Error&error='+error);
	}
};

exports.loginAder = async(req, res) => {
	// console.log("/loginAder");
	try {
		const code = req.body.code.replace(/^\s*/g,"").toUpperCase();
		const pwd = req.body.pwd.replace(/^\s*/g,"");
		let Ader = await AderDB.findOne({code: code});
		if(!Ader) return res.redirect('/error?info=Adminnistrator Code 不正确, 请重新登陆');

		const isMatch = bcrypt.compare(pwd, Ader.pwd);
		if(!isMatch) return res.redirect('/error?info=Adminnistrator Code 密码不符, 请重新登陆');

		req.session.crAder = Ader;
		return res.redirect('/ader');
	} catch(error) {
		return res.redirect('/error?info=loginAder,Error&error='+error);
	}
}

exports.aderLogout = (req, res) => {
	// console.log("/aderLogout");
	try{
		delete req.session.crAder;
		res.redirect('/');
	} catch(error) {
		return res.redirect('/error?info=aderLogout,Error&error='+error);
	}
}