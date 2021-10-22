const Index = require('../controllers/ader/index');

const Ader = require('../controllers/ader/Ader'); // ct control
const Firm = require('../controllers/ader/Firm');
const User = require('../controllers/ader/User');

const multipart = require('connect-multiparty');
const postForm = multipart();

module.exports = function(app){

	/* index --------------- Ader 首页 登录页面 登录 登出---------------------- */
	app.get('/ader', Index.aderHome);
	app.get('/aderLogin', Index.aderLogin);
	app.post('/loginAder', Index.loginAder);
	app.get('/aderLogout', Index.aderLogout);

	/* index -------------------- 添加删除(后期要关闭) ----------------------------- */
	app.get('/aderAdd', Ader.aderAdd);
	app.post('/aderNew', Ader.aderNew);
	app.get('/aderDel/:id', aderIsLogin, Ader.aderDel);

	app.get('/aders', aderIsLogin, Ader.aders);
	app.get('/ader/:id', aderIsLogin, Ader.ader);


	/* Firm ---------------------- Firm ---------------------------------- */
	app.get('/adFirms', aderIsLogin, Firm.adFirms);
	app.get('/adFirm/:id', aderIsLogin, Firm.adFirm);
	app.get('/adFirmDel/:id', aderIsLogin, Firm.adFirmDel);
	
	app.post('/adFirmUpd', aderIsLogin, postForm, Firm.adFirmUpd);

	app.get('/adFirmAdd', aderIsLogin, Firm.adFirmAdd);
	app.post('/adFirmNew', aderIsLogin, postForm, Firm.adFirmNew);
	
	app.delete('/adFirmDelAjax', aderIsLogin, Firm.adFirmDelAjax);

	/* User ---------------------- User ---------------------------------- */
	app.get('/adUsers', aderIsLogin, User.adUsers);
	app.get('/adUser/:id', aderIsLogin, User.adUser);
	app.get('/adUserDel/:id', aderIsLogin, User.adUserDel);

	app.post('/adUserUpdInfo', aderIsLogin, postForm, User.adUserUpdInfo);
	app.post('/adUserUpdCode', aderIsLogin, postForm, User.adUserUpdCode);
	app.post('/adUserUpdPwd', aderIsLogin, postForm, User.adUserUpdPwd);

	app.get('/adUserAdd', aderIsLogin, User.adUserAdd);
	app.post('/adUserNew', aderIsLogin, postForm, User.adUserNew);
}

const aderIsLogin = function(req, res, next) {
	const crAder = req.session.crAder;
	if(!crAder) {
		return res.redirect('/error?info=aderIsLogin，需要您的Administrator账户');
	} else {
		next();
	}
};