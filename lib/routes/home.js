'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;

module.exports = app => {

	// Home page
	app.get('/', cacheControl({maxAge: '7d'}), (request, response) => {
		response.render('index', {
			layout: 'main',
			title: 'Origami Bower Registry'
		});
	});

};
