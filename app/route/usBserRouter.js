const Lang = require('../controllers/user/bser/lang');

const Size = require('../controllers/user/bser/attr/Size');
const Color = require('../controllers/user/bser/attr/Color');

const Ptern = require('../controllers/user/bser/pattern/Ptern');
const PtFirm = require('../controllers/user/bser/pattern/PtFirm');
const PtCateg = require('../controllers/user/bser/pattern/PtCateg');

const MtCateg = require('../controllers/user/bser/material/MtCateg');
const MtFirm = require('../controllers/user/bser/material/MtFirm');
const Mtrial = require('../controllers/user/bser/material/Mtrial');

const PdCateg = require('../controllers/user/bser/product/PdCateg');
const PdNome = require('../controllers/user/bser/product/PdNome');
const PdspuBasic = require('../controllers/user/bser/product/basic');
const PdspuAttr = require('../controllers/user/bser/product/attr');

const Order = require('../controllers/user/bser/order/Order');
const Odspu = require('../controllers/user/bser/order/Odspu');
const Odsku = require('../controllers/user/bser/order/Odsku');

const User = require('../controllers/user/bser/login/User');

const MdFile = require('../middle/MdFile');

const postForm = require('connect-multiparty')();

module.exports = app => {
	/* ------------------------ 首页 登录页面 登录 登出 ------------------------ */
	app.get('/bser', bserIsLogin, (req, res) => {return res.render("./user/bser/index", {title: "Home Bser", crUser: req.session.crUser});});

	/* ============================================= order ============================================= */
	app.get('/bsOrders', bserIsLogin, Order.bsOrders);
	app.get('/bsOrdersAjax', bserIsLogin, Order.bsOrdersAjax);
	app.post('/bsOrderNew', bserIsLogin, postForm, Order.bsOrderNew);
	app.get('/bsOrderUpdStepAjax', bserIsLogin, Order.bsOrderUpdStepAjax);
	app.post('/bsOrderUpdAjax', bserIsLogin, postForm, Order.bsOrderUpdAjax);
	app.get('/bsOrder/:id', bserIsLogin, Order.bsOrder);
	app.get('/bsOrderDel/:id', bserIsLogin, Order.bsOrderDel);

	app.post('/bsOrderCostMtAjax', bserIsLogin, postForm, Order.bsOrderCostMtAjax);
	app.get('/bsOrderAnalysAjax', bserIsLogin, Order.bsOrderAnalysAjax);
	/* ------------------------ Odspu ------------------------ */
	app.get('/bsOdspusAjax', bserIsLogin, Odspu.bsOdspusAjax);
	app.post('/bsOdspuNew', bserIsLogin, postForm, Odspu.bsOdspuNew);
	app.get('/bsOdspuDel/:id', bserIsLogin, Odspu.bsOdspuDel);
	/* ------------------------ Odsku ------------------------ */
	app.post('/bsOdskuNewAjax', bserIsLogin, postForm, Odsku.bsOdskuNewAjax);
	app.post('/bsOdskuUpdAjax', bserIsLogin, postForm, Odsku.bsOdskuUpdAjax);

	/* ============================================= User ============================================= */
	app.get('/bsUsers', bserIsLogin, User.bsUsers);
	app.get('/bsUsersAjax', bserIsLogin, User.bsUsersAjax);
	app.get('/bsUser/:id', bserIsLogin, User.bsUser);
	app.get('/bsUserDel/:id', bserIsLogin, User.bsUserDel);

	app.post('/bsUserUpdInfo', bserIsLogin, postForm, User.bsUserUpdInfo);
	app.post('/bsUserUpdCode', bserIsLogin, postForm, User.bsUserUpdCode);
	app.post('/bsUserUpdPwd', bserIsLogin, postForm, User.bsUserUpdPwd);

	app.get('/bsUserAdd', bserIsLogin, User.bsUserAdd);
	app.post('/bsUserNew', bserIsLogin, postForm, User.bsUserNew);

	/* ============================================= product ============================================= */
	/* ------------------------ basic ------------------------ */
	app.get('/bsPdspuAdd', bserIsLogin, PdspuBasic.bsPdspuAdd);
	app.post('/bsPdspuNew', bserIsLogin, postForm, PdspuBasic.bsPdspuNew);

	app.get('/bsPdspus', bserIsLogin, PdspuBasic.bsPdspus);
	app.get('/bsPdspusAjax', bserIsLogin, PdspuBasic.bsPdspusAjax);
	app.get('/bsPdspuAjax', bserIsLogin, PdspuBasic.bsPdspuAjax);
	app.get('/bsPdspu/:id', bserIsLogin, PdspuBasic.bsPdspu);
	app.get('/bsPdspuDel/:id', bserIsLogin, PdspuBasic.bsPdspuDel);
	app.get('/bsPdspuUp/:id', bserIsLogin, PdspuBasic.bsPdspuUp);
	app.post('/bsPdspuUpd', bserIsLogin, postForm, PdspuBasic.bsPdspuUpd);
	app.post('/bsPdspuUpdAjax', bserIsLogin, PdspuBasic.bsPdspuUpdAjax);
	app.post('/bsPdspuPhotoUpd', bserIsLogin, postForm, MdFile.newFiles, PdspuBasic.bsPdspuPhotoUpd);

	/* ------------------------ attr ------------------------ */
	app.get('/bsPdspuSizeUp/:id', bserIsLogin, PdspuAttr.bsPdspuSizeUp);
	app.get('/bsPdspuSizeNewAjax', bserIsLogin, PdspuAttr.bsPdspuSizeNewAjax);
	app.get('/bsPdspuSizeDelAjax', bserIsLogin, PdspuAttr.bsPdspuSizeDelAjax);

	app.get('/bsPdspuColorUp/:id', bserIsLogin, PdspuAttr.bsPdspuColorUp);
	app.get('/bsPdspuColorUpdAjax', bserIsLogin, PdspuAttr.bsPdspuColorUpdAjax);

	app.get('/bsPdspuPternUp/:id', bserIsLogin, PdspuAttr.bsPdspuPternUp);
	app.get('/bsPdspuPternUpdAjax', bserIsLogin, PdspuAttr.bsPdspuPternUpdAjax);

	app.get('/bsPdspuMtrialUp/:id', bserIsLogin, PdspuAttr.bsPdspuMtrialUp);
	app.get('/bsPdspuMtrialUpdAjax', bserIsLogin, PdspuAttr.bsPdspuMtrialUpdAjax);

	app.post('/bsPdSpusPhotosNew', bserIsLogin, postForm, MdFile.newFiles, PdspuAttr.bsPdSpusPhotosNew);
	app.get('/bsPdSpusPhotosDel/:id', bserIsLogin, PdspuAttr.bsPdSpusPhotosDel);

	app.post('/bsPdspuPdCostMtUpdAjax', bserIsLogin, PdspuAttr.bsPdspuPdCostMtUpdAjax);
	app.post('/bsPdspuPdskuUpdAjax', bserIsLogin, PdspuAttr.bsPdspuPdskuUpdAjax);

	/* ------------------------ PdNome ------------------------ */
	app.get('/bsPdNomes', bserIsLogin, PdNome.bsPdNomes);
	app.get('/bsPdNomesAjax', bserIsLogin, PdNome.bsPdNomesAjax);
	app.get('/bsPdNomeAdd', bserIsLogin, PdNome.bsPdNomeAdd);
	app.post('/bsPdNomeNew', bserIsLogin, postForm, PdNome.bsPdNomeNew);
	app.get('/bsPdNomeDel/:id', bserIsLogin, PdNome.bsPdNomeDel);
	app.post('/bsPdNomeUpdAjax', bserIsLogin, PdNome.bsPdNomeUpdAjax);

	/* ------------------------ PdCateg 产品分类 ----------------------- */
	app.get('/bsPdCategs', bserIsLogin, PdCateg.bsPdCategs);
	app.get('/bsPdCategsAjax', bserIsLogin, PdCateg.bsPdCategsAjax);
	app.get('/bsPdCategAdd', bserIsLogin, PdCateg.bsPdCategAdd);
	app.post('/bsPdCategNew', bserIsLogin, postForm, PdCateg.bsPdCategNew);
	app.get('/bsPdCategDel/:id', bserIsLogin, PdCateg.bsPdCategDel);
	app.post('/bsPdCategUpdAjax', bserIsLogin, PdCateg.bsPdCategUpdAjax);

	app.get('/bsPdCateg/:id', bserIsLogin, PdCateg.bsPdCateg);
	app.get('/bsPdCategUp/:id', bserIsLogin, PdCateg.bsPdCategUp);
	app.post('/bsPdCategUpd', bserIsLogin, postForm, PdCateg.bsPdCategUpd);
	/* ============================================= product ============================================= */

	/* ============================================= matrial ============================================= */
	/* ------------------------ Mtrial 材质 ------------------------ */
	app.get('/bsMtrials', bserIsLogin, Mtrial.bsMtrials);
	app.get('/bsMtrialsAjax', bserIsLogin, Mtrial.bsMtrialsAjax);
	app.get('/bsMtrialAdd', bserIsLogin, Mtrial.bsMtrialAdd);
	app.post('/bsMtrialNew', bserIsLogin, postForm, Mtrial.bsMtrialNew);
	app.post('/bsMtrialUpdAjax', bserIsLogin, Mtrial.bsMtrialUpdAjax);
	app.get('/bsMtrialDel/:id', bserIsLogin, Mtrial.bsMtrialDel);

	app.post('/bsMtrialPhotoUpd', bserIsLogin, postForm, MdFile.newFiles, Mtrial.bsMtrialPhotoUpd);

	app.get('/bsMtrial/:id', bserIsLogin, Mtrial.bsMtrial);
	app.get('/bsMtrialUp/:id', bserIsLogin, Mtrial.bsMtrialUp);
	app.post('/bsMtrialUpd', bserIsLogin, postForm, Mtrial.bsMtrialUpd);

	/* ------------------------ MtFirm 供货商 ----------------------- */
	app.get('/bsMtFirms', bserIsLogin, MtFirm.bsMtFirms);
	app.get('/bsMtFirmsAjax', bserIsLogin, MtFirm.bsMtFirmsAjax);
	app.get('/bsMtFirmAdd', bserIsLogin, MtFirm.bsMtFirmAdd);
	app.post('/bsMtFirmNew', bserIsLogin, postForm, MtFirm.bsMtFirmNew);
	app.get('/bsMtFirmDel/:id', bserIsLogin, MtFirm.bsMtFirmDel);
	app.post('/bsMtFirmUpdAjax', bserIsLogin, MtFirm.bsMtFirmUpdAjax);

	/* ------------------------ MtCateg 材质分类 ----------------------- */
	app.get('/bsMtCategs', bserIsLogin, MtCateg.bsMtCategs);
	app.get('/bsMtCategsAjax', bserIsLogin, MtCateg.bsMtCategsAjax);
	app.get('/bsMtCategAdd', bserIsLogin, MtCateg.bsMtCategAdd);
	app.post('/bsMtCategNew', bserIsLogin, postForm, MtCateg.bsMtCategNew);
	app.get('/bsMtCategDel/:id', bserIsLogin, MtCateg.bsMtCategDel);
	app.post('/bsMtCategUpdAjax', bserIsLogin, MtCateg.bsMtCategUpdAjax);

	app.get('/bsMtCateg/:id', bserIsLogin, MtCateg.bsMtCateg);
	app.get('/bsMtCategUp/:id', bserIsLogin, MtCateg.bsMtCategUp);
	app.post('/bsMtCategUpd', bserIsLogin, postForm, MtCateg.bsMtCategUpd);
	/* ============================================= matrial ============================================= */

	/* ============================================= pattern ============================================= */
	/* ------------------------ Ptern ------------------------ */
	app.get('/bsPterns', bserIsLogin, Ptern.bsPterns);
	app.get('/bsPternsAjax', bserIsLogin, Ptern.bsPternsAjax);
	app.get('/bsPternAdd', bserIsLogin, Ptern.bsPternAdd);
	app.post('/bsPternNew', bserIsLogin, postForm, Ptern.bsPternNew);
	app.post('/bsPternUpdAjax', bserIsLogin, Ptern.bsPternUpdAjax);
	app.get('/bsPternDel/:id', bserIsLogin, Ptern.bsPternDel);

	app.post('/bsPternPhotoUpd', bserIsLogin, postForm, MdFile.newFiles, Ptern.bsPternPhotoUpd);

	app.get('/bsPtern/:id', bserIsLogin, Ptern.bsPtern);
	app.get('/bsPternUp/:id', bserIsLogin, Ptern.bsPternUp);
	app.post('/bsPternUpd', bserIsLogin, postForm, Ptern.bsPternUpd);

	/* ------------------------ PtFirm 印花厂 ----------------------- */
	app.get('/bsPtFirms', bserIsLogin, PtFirm.bsPtFirms);
	app.get('/bsPtFirmsAjax', bserIsLogin, PtFirm.bsPtFirmsAjax);
	app.get('/bsPtFirmAdd', bserIsLogin, PtFirm.bsPtFirmAdd);
	app.post('/bsPtFirmNew', bserIsLogin, postForm, PtFirm.bsPtFirmNew);
	app.get('/bsPtFirmDel/:id', bserIsLogin, PtFirm.bsPtFirmDel);
	app.post('/bsPtFirmUpdAjax', bserIsLogin, PtFirm.bsPtFirmUpdAjax);
	/* ------------------------ PtCateg 印花分类 ----------------------- */
	app.get('/bsPtCategs', bserIsLogin, PtCateg.bsPtCategs);
	app.get('/bsPtCategsAjax', bserIsLogin, PtCateg.bsPtCategsAjax);
	app.get('/bsPtCategAdd', bserIsLogin, PtCateg.bsPtCategAdd);
	app.post('/bsPtCategNew', bserIsLogin, postForm, PtCateg.bsPtCategNew);
	app.get('/bsPtCategDel/:id', bserIsLogin, PtCateg.bsPtCategDel);
	app.post('/bsPtCategUpdAjax', bserIsLogin, PtCateg.bsPtCategUpdAjax);

	app.get('/bsPtCateg/:id', bserIsLogin, PtCateg.bsPtCateg);
	app.get('/bsPtCategUp/:id', bserIsLogin, PtCateg.bsPtCategUp);
	app.post('/bsPtCategUpd', bserIsLogin, postForm, PtCateg.bsPtCategUpd);
	/* ============================================= pattern ============================================= */

	/* ============================================= attr ============================================= */
	/* ------------------------ Size ------------------------ */
	app.get('/bsSizes', bserIsLogin, Size.bsSizes);
	app.get('/bsSizeSystAdd', bserIsLogin, Size.bsSizeSystAdd);
	app.post('/bsSizeSystNew', bserIsLogin, postForm, Size.bsSizeSystNew);
	app.post('/bsSizeSystUpdAjax', bserIsLogin, Size.bsSizeSystUpdAjax);
	
	app.post('/bsSizeNewAjax', bserIsLogin, Size.bsSizeNewAjax);
	app.post('/bsSizeUpdAjax', bserIsLogin, Size.bsSizeUpdAjax);
	app.get('/bsSizeSystDel/:id', bserIsLogin, Size.bsSizeSystDel);

	/* ------------------------ Color ------------------------ */
	app.get('/bsColors', bserIsLogin, Color.bsColors);
	app.get('/bsColorsAjax', bserIsLogin, Color.bsColorsAjax);
	app.get('/bsColorAdd', bserIsLogin, Color.bsColorAdd);
	app.get('/bsColorDel/:id', bserIsLogin, Color.bsColorDel);
	app.post('/bsColorNew', bserIsLogin, postForm, Color.bsColorNew);
	app.post('/bsColorUpdAjax', bserIsLogin, Color.bsColorUpdAjax);
	app.post('/bsColorPhotoUpd', bserIsLogin, postForm, MdFile.newFiles, Color.bsColorPhotoUpd);

	app.get('/bsColor/:id', bserIsLogin, Color.bsColor);
	/* ============================================= attr ============================================= */

	/* ------------------------ Lang ------------------------ */
	app.get('/bsLangs', bserIsLogin, Lang.bsLangs);
	app.get('/bsLangAdd', bserIsLogin, Lang.bsLangAdd);
	app.post('/bsLangNew', bserIsLogin, postForm, Lang.bsLangNew);
	app.post('/bsLangUpdAjax', bserIsLogin, Lang.bsLangUpdAjax);
};

const bserIsLogin = function(req, res, next) {
	const crUser = req.session.crUser;
	if(!crUser || crUser.role != 1) {
		return res.redirect('/error?info=bserIsLogin，需要您的管理者账户');
	} else {
		next();
	}
};