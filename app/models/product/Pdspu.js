const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Pdspu';
const dbSchema = new Schema({
	/* ------------------ Basic ------------------ */
	code: String,	// 编号公司唯一
	PdCategFir: {type: ObjectId, ref: 'PdCateg'},	// 种类
	PdCategSec: {type: ObjectId, ref: 'PdCateg'},	// 种类
	PdCategThd: {type: ObjectId, ref: 'PdCateg'},	// 种类
	PdNome: {type: ObjectId, ref: 'PdNome'},	// 名称
	desp: String,		// 描述
	photo: String,
	photos: [String],
	langs: [{
		Lang: {type: ObjectId, ref: 'Lang'},
		nome: String,
		desp: String
	}],

	weight: Number, // 重量

	Mtrials: [{type: ObjectId, ref: 'Mtrial'}],
	/* 用料: 根据尺寸 确定所有用料 比如 布料1 不料2 扣子1 腰带 要显示在商品详情页下*/
	PdCostMts: [{type: ObjectId, ref: 'PdCostMt'}],

	/* ------------------ Attr sku ------------------ */
	Pterns: [{type: ObjectId, ref: 'Ptern'}],

	Colors: [{type: ObjectId, ref: 'Color'}],

	SizeSyst: {type: ObjectId, ref: 'SizeSyst'},
	sizes: [String],

	Pdskus: [{type: ObjectId, ref: 'Pdsku'}],


	/* ------------------ 价格 ------------------ */
	price: Float,
	cost: Float,

	Odspus: [{type: ObjectId, ref: 'Odspu'}],

	// status: Number,		// 其他标识
	shelf: Number,		// 上下架
	sort: Number,		// 权重
	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	crtAt: Date,
	updAt: Date,
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.sort) this.sort = 1;
		if(!this.shelf) this.shelf = 1;
		this.crtAt = Date.now();
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);