'use strict';

var Db   = require('../../')
  , Enum = require('dbjs-ext/string/string-line/enum');

module.exports = Enum;

require('../../_controls/radio');
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
			var label = item._label, toDOM = label.__toDOM.__value;
			this.dom.appendChild(this.createOption(value,
					toDOM.call(label, document)));
		}, this);
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	return Box;
}));

Enum.set('DOMRadioBox', Db.external(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMRadioBox;
	Box = function (document, ns, relation) {
		Parent.call(this, document, ns);
		this.dom.classList.add('enum');
		this.relation = relation;
		ns.options.forEach(function (value, item) {
			var label = item._label, toDOM = label.__toDOM.__value;
			this.dom.appendChild(this.createOption(value,
				toDOM.call(label, document)));
		}, this);
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	return Box;
}));

Enum.set('toDOMInputBox', function (document/*, options*/) {
	var box, options = Object(arguments[1]);
	if (options.type === 'radio') {
		box = new this.DOMRadioBox(document, this);
	} else {
		box = new this.DOMInputBox(document, this);
	}
	Object.keys(options).forEach(function (name) {
		if ((name.indexOf('data-') === 0) ||
				this.allowedDOMInputAttrs.has(name)) {
			box.setAttribute(name, options[name]);
		}
	}, this);
	return box;
});
