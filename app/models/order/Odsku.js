const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Odsku';
const dbSchema = new Schema({
	/* ------------------ Basic ------------------ */
	Odspu: {type: ObjectId, ref: 'Odspu'},

	// 为了前端排序
	Pdspu: {type: ObjectId, ref: 'Pdspu'},
	Ptern: {type: ObjectId, ref: 'Ptern'},
	size: String,
	Color: {type: ObjectId, ref: 'Color'},

	Pdsku: {type: ObjectId, ref: 'Pdsku'},
	/* ------------------ 库存 ------------------ */
	quan: Number,
	ship: Number,	// 发货量

	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	crtAt: Date,
	updAt: Date,
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.quan) this.quan = 0;
		if(!this.ship) this.ship = 0;
		this.crtAt = Date.now();
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);