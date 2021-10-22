const Conf = {
	roleNums: [1, 99],
	roleAdmins: [1],
	roleUser: {
		owner:    {num: 1, index: '/ower', code: 'bs', val: '拥有者 OWNER', },
		// manager:  {num: 3, index: '/mger', code: 'mg', val: '管理者 Manager', },
		// staff:    {num: 5, index: '/sfer', code: 'sf', val: '员工 Staff', },
		// finance:  {num:10, index: '/fner', code: 'fn', val: '财务 Finance', },
		// brander:  {num:20, index: '/bner', code: 'bn', val: '品牌 Brander', },
		// promotion:{num:25, index: '/pmer', code: 'pm', val: '推广 Promotion', },
		// order:    {num:30, index: '/oder', code: 'od', val: '订单 Order', },
		// quotation:{num:50, index: '/qter', code: 'qt', val: '报价 Quotation', },
		// logistic: {num:70, index: '/lger', code: 'lg', val: '物流 Logistic', },
		// boss:     {num:90, index: '/bser', code: 'bs', val: '老板 BOSS', },
		// seller:   {num:95, index: '/sler', code: 'sl', val: '销售 SELLER', },
		customer: {num:99, index: '/cter', code: 'ct', val: '客户 Customer', },
	},
	photo: {
		Pdspu: {dir: '/PDSPU/', def: '/UPLOAD/DEF/PDSPU.JPG'},
		Mtrial: {dir: '/MTRIAL/', def: '/UPLOAD/DEF/MTRIAL.JPG'},
		Ptern: {dir: '/PTERN/', def: '/UPLOAD/DEF/PTERN.JPG'},
		Color: {dir: '/COLOR/', def: '/UPLOAD/DEF/COLOR.JPG'}
	},

	shelf: {
		off: {num: -1, val: '下架'},
		put:{num: 1, val: '上架'}
	},
	isBottom: {
		n: {num: -1, val: '非底层'},
		y: {num: 1, val: '底层'}
	},

	SizeNums: [6, 7, 8, 9, 10, 11, 12, 13, 14],

	month: {
		1: "JAN", 2: "FEB", 3: "MAR", 4: "APR", 5: "MAY", 6: "JUN",
		7: "JUL", 8: "AUG", 9: "SEP", 10: "OCT", 11: "NOV", 12: "DEC"
	},
	OrderStep: {
		init: {num: 1, val: "创建中"},
		check: {num: 5, val: "审核中"},
		deal: {num: 10, val: "处理中"},
		ship: {num: 15, val: "发货中"},
		finish: {num: 20, val: "完成"},
		history: {num: 50, val: "历史"},
	},
	OrderCateg: {
		shop: {num: 1, val: "商店下单"},
		web: {num: 5, val: "网上下单"},
	},
	isPtern: {
		n: {num: -1, val: "不印花"},
		y: {num: 1, val: "印花"},
	},


	bsOrderGetCode : (code, firmCode) => {
		
	}
}

module.exports = Conf