const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Ptern';
const dbSchema = new Schema({
	code: String,

	PtCategFir: {type: ObjectId, ref: 'PtCateg'},
	PtCategSec: {type: ObjectId, ref: 'PtCateg'},
	PtCategThd: {type: ObjectId, ref: 'PtCateg'},

	PtFirm: {type: ObjectId, ref: 'PtFirm'},

	langs: [{
		Lang: {type: ObjectId, ref: 'Lang'},
		nome: String,
		desp: String,
	}],
	photo: String,

	/* ------------------ 价格 ------------------ */
	cost: Float,

	shelf: Number,
	sort: Number,
	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	updAt: Date,
});

dbSchema.pre('save', function(next) {
	if(this.isNew) {
		if(!this.sort) this.sort = 1;
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);