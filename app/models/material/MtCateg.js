const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const colection = 'MtCateg';
const dbSchema = new Schema({
	/* ------------------ 创建时 ------------------ */
	code: String,										// 本公司唯一 req
	langs: [{
		Lang: {type: ObjectId, ref: 'Lang'},
		nome: String
	}],

	level: Number,										// 分类层级
	MtCategFar: {type: ObjectId, ref: 'MtCateg'},		// req
	MtCategSons: [{type: ObjectId, ref: 'MtCateg'}],
	isBottom: Number,									// 是否是最底层分类 req

	shelf: Number,										// req
	sort: Number,										// req
	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	updAt: Date,
});

dbSchema.pre('save', function(next) {
	if(this.isNew) {
		if(!this.shelf) this.shelf = 1;
		if(!this.sort) this.sort = 1;
		if(!this.level) this.level = 1;
		if(!this.isBottom) this.isBottom = -1;
		if(this.level == 3) this.isBottom = 1;
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);