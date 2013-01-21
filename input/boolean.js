'use strict';

var Db = require('dbjs')

  , BooleanType = module.exports = Db.Boolean;

require('./_controls/radio');

BooleanType.set('DOMInputBox', Db.external(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMRadioBox;
	Box = function (document, ns, relation) {
		var trueText, falseText;
		Parent.call(this, document, ns);
		this.relation = relation;
		trueText = (relation && relation.trueLabel) ?
				relation._trueLabel.toDOM(document) : ns._trueLabel.toDOM(document);
		falseText = (relation && relation.falseLabel) ?
				relation._falseLabel.toDOM(document) : ns._falseLabel.toDOM(document);
		this.dom.appendChild(this.createOption('1', trueText));
		this.dom.appendChild(document.createTextNode(' '));
		this.dom.appendChild(this.createOption('0', falseText));
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.set = function (value) {
		if (value != null) value = (value && value.valueOf()) ? '1' : '0';
		Parent.prototype.set.call(this, value);
	};
	return Box;
}));
BooleanType.set('DOMCheckboxBox', Db.external(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMInputBox;
	Box = function (document, ns) {
		Parent.apply(this, arguments);
		this.dom.setAttribute('type', 'checkbox');
		this.dom.setAttribute('value', '1');
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.set = function (value) {
		if ((value == null) || !value.valueOf()) {
			this.dom.removeAttribute('checked');
			this.checked = false;
		} else {
			this.dom.setAttribute('checked', 'checked');
			this.checked = true;
		}
	};
	return Box;
}));
BooleanType.set('toDOMInputBox', function (document/*, options, relation*/) {
	var box, options = Object(arguments[1]), relation = arguments[2];
	if (options.type === 'checkbox') {
		box = new this.DOMCheckboxBox(document, this);
	} else {
		box = new this.DOMInputBox(document, this, relation);
	}
	Object.keys(options).forEach(function (name) {
		if ((name.indexOf('data-') === 0) ||
				this.allowedDOMInputAttrs.has(name)) {
			box.setAttribute(name, options[name]);
		}
	}, this);
	return box;
});
BooleanType.fromDOMInputValue = function (value) {
	return (value === '1') ? true : false;
};
