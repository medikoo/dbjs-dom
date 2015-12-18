'use strict';

var assign         = require('es5-ext/object/assign')
  , isFunction     = require('es5-ext/function/is-function')
  , d              = require('d')
  , DOMValue       = require('./utils/rel-value')
  , PropObserv     = require('dbjs/_setup/1.property/observable')
  , DescPropObserv = require('dbjs/_setup/3.descriptor-property/observable')

  , common;

common = {
	assignDOMText: d(function (text/*, options*/) {
		var listener;
		text.dismiss();
		this.on('change', listener = function (event) {
			text.value = event.newValue;
		});
		text.value = this.value;
		text.dismiss = this.off.bind(this, 'change', listener);
		return text;
	}),
	toDOM: d(function (document/*, options*/) {
		var options = arguments[1];
		if (!isFunction(options)) {
			return this.toDOMText(document, options).dom;
		}
		return (new DOMValue(document, this, options)).toDOM();
	}),
	toDOMAttr: d(function (element/*, name, options*/) {
		if (this.value && this.value.toDOMAttr) {
			return this.value.toDOMAttr(element, arguments[1], arguments[2]);
		}
		return this.toDOMAttrBox(element, arguments[1], arguments[2]).dom;
	}),
	lastModifiedDOM: d(function (document) {
		var dom = document.createTextNode(''), onUpdate;
		onUpdate = function () {
			var value = this.lastModified;
			if (value) {
				value = new this.object.database.DateTime(this.lastModified / 1000);
			}
			dom.data = value || '';
		};
		this.on('change', onUpdate);
		onUpdate.call(this);
		return dom;
	})
};

Object.defineProperties(PropObserv.prototype, assign(common, {
	toDOMText: d(function (document/*, options*/) {
		var options = Object(arguments[1]), desc = this.descriptor, text;
		options.observable = this;
		if (options.DOMText) text = new options.DOMText(document, desc.type, options);
		else if (this.descriptor.DOMText) text = new desc.DOMText(document, desc.type, options);
		else text = desc.type.toDOMText(document, options);
		return this.assignDOMText(text);
	}),
	toDOMAttrBox: d(function (element/*, name, options*/) {
		var name = arguments[1], options = Object(arguments[2]);
		if (name == null) name = this.key;
		options.observable = this;
		return this.assignDOMText(this.descriptor.type.toDOMAttrBox(element,
			name, options), options);
	})
}));

Object.defineProperties(DescPropObserv.prototype, assign(common, {
	toDOMText: d(function (document/*, options*/) {
		var options = Object(arguments[1]);
		return this.assignDOMText(this.descriptor.type.toDOMText(document,
			options));
	}),
	toDOMAttrBox: d(function (element/*, name, options*/) {
		var name = arguments[1], options = Object(arguments[2]);
		if (name == null) name = this.key;
		return this.assignDOMText(this.descriptor.type.toDOMAttrBox(element,
			name, options), options);
	})
}));
