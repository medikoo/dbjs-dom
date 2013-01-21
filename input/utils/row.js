'use strict';

require('../');

var relation = require('dbjs/lib/_relation');

require('../../text');
require('./validation-tick');

relation.set('toDOMInputRow', function (document/*, options*/) {
	var container, labelBox, inputBox, id, classes, el, box, label, toDOM
	  , options = Object(arguments[1]), checkChanged, rel = this;
	id = this.__DOMId._value.call(this) + (options.idPostfix || '');
	container = document.createElement('tr');
	container.id = 'tr-' + id;
	classes = this.tags.values;
	if (this.required) classes.unshift('required');
	classes.unshift('dbjs');
	container.setAttribute('class', classes.join(' '));

	labelBox = container.appendChild(document.createElement('th'))
		.appendChild(document.createElement('label'));
	labelBox.setAttribute('for', 'input-' + id);
	inputBox = container.appendChild(document.createElement('td'));
	label = this._label;
	toDOM = label.__toDOM.__value;
	labelBox.appendChild(toDOM.call(label, document));
	labelBox.appendChild(document.createTextNode(':'));
	box = this.__toDOMInputBox.__value.call(this, document, options);
	box.setAttribute('id', 'input-' + id);
	inputBox.appendChild(box.dom);
	if (this.required) {
		el = inputBox.appendChild(document.createElement('span'));
		el.setAttribute('class', 'required-icon');
		el.appendChild(document.createTextNode(' *'));
	}
	inputBox.appendChild(this.__toDOMValidationTick.__value.call(this, box));

	el = inputBox.appendChild(document.createElement('span'));
	el.setAttribute('id', 'error-' + id);
	el.setAttribute('class', 'error-message');
	if (this.__fieldHint && this.__fieldHint.__value) {
		el = inputBox.appendChild(document.createElement('p'));
		el.setAttribute('class', 'hint');
		el.appendChild(this._fieldHint.toDOM(document));
	}

	checkChanged = function () {
		container.classList[(rel.__value === box.get()) ? 'remove' :
				'add']('changed');
	};
	box.dom.addEventListener('change', checkChanged, false);
	box.dom.addEventListener('keyup', checkChanged, false);
	this.on('change', checkChanged);
	return container;
});
