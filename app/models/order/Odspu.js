const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Odspu';
const dbSchema = new Schema({
	/* ------------------ Attr sku ------------------ */
	Order: {type: ObjectId, ref: 'Order'},

	Pdspu: {type: ObjectId, ref: 'Pdspu'},
	Pterns: [{type: ObjectId, ref: 'Ptern'}],
	Colors: [{type: ObjectId, ref: 'Color'}],
	sizes: [String],

	Odskus: [{type: ObjectId, ref: 'Odsku'}],

	// /* ------------------ 价格 ------------------ */
	quan: Number,	// 订货数量	下单后更新
	ship: Number,	// 发货数量	完成后更新

	price: Float, 					// 商品单价
	tot: Float,						// 订货总价
	totle: Float,					// 发货后总价

	// 为了后期分析数据， 每次添加的时候要根Order相同
	step: Number,					// 订单状态 // 录入为1, 提交为5 审核确认为15 完成为20
	cter: {type: ObjectId, ref: 'User'},		// 客户		
	crter: {type: ObjectId, ref: 'User'},		// 销售人员
	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	crtAt: Date,
	updAt: Date,
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.categ) this.categ = 1;
		if(!this.step) this.step = 1;

		if(!this.price) this.price = 0;
		if(!this.tot) this.tot = 0;
		if(!this.totle) this.totle = 0;

		if(!this.quan) this.quan = 0;
		if(!this.ship) this.ship = 0;
		this.crtAt = Date.now();
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);