'use strict';

var Db   = require('../../')
  , Enum = require('dbjs-ext/string/string-line/enum');

module.exports = Enum;

require('../../_controls/select');

Enum.set('chooseLabel',
	Db.StringLine.rel({ required: true, value: 'Choose:' }));

Enum.set('DOMInputBox', Db.external(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMSelectBox;
	Box = function (document, ns) {
		Parent.call(this, document, ns);
		this.dom.appendChild(this.createOption('',
			ns._chooseLabel.toDOM(document)));
		ns.options.forEach(function (value, item) {
			this.dom.appendChild(this.createOption(value,
				item._label.toDOM(document)));
		}, this);
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	return Box;
}));
