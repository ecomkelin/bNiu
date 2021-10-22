const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Size';
const dbSchema = new Schema({
	SizeSyst: {type: ObjectId, ref: 'SizeSyst'},
	size: Number,

	symbol: String,

	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	updAt: Date,
});

dbSchema.pre('save', function(next) {
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);