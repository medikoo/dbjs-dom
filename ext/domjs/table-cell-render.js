'use strict';

var d     = require('es5-ext/lib/Object/descriptor')
  , Table = require('../../text/utils/table')

  , cellRender = Table.prototype.cellRender
  , customRender;

customRender = function (render, item) {
	var direct, df;
	df = this.domjs.collect(function () { direct = render(item); });
	return direct || df;
};

Object.defineProperty(Table.prototype, 'cellRender', d(function (render, item) {
	if (!this.domjs) return cellRender.call(this, render, item);
	return cellRender.call(this, customRender.bind(this, render), item);
}));
