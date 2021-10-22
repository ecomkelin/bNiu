module.exports = function(app){
	require('./aaAderRouter')(app);
	require('./aaRouter')(app);
	require('./usBserRouter')(app);

	app.get('/error', (req, res, next) => {
		res.render('./errorPage', {
			info: req.query.info,
			error: req.query.error,
			redirectUrl: req.query.redirectUrl
		})
	});
};