const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Pdsku';
const dbSchema = new Schema({
	/* ------------------ Basic ------------------ */
	Pdspu: {type: ObjectId, ref: 'Pdspu'},
	Ptern: {type: ObjectId, ref: 'Ptern'},
	Color: {type: ObjectId, ref: 'Color'},
	size: String,

	/* 用料: 根据尺寸 确定所有用料 比如 布料1 不料2 扣子1 腰带 , 订单查询比较方便*/
	PdCostMts: [{type: ObjectId, ref: 'PdCostMt'}],

	/* ------------------ 库存 ------------------ */
	stock: Number,
	sale: Number,


	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.stock) this.stock = 0;
		if(!this.sale) this.sale = 0;
	}
	next();
})

module.exports = mongoose.model(colection, dbSchema);