'use strict';

var makeElement = require('dom-ext/document/#/make-element')
  , getId       = require('dom-ext/html-element/#/get-id');

module.exports = function (containerName) {
	return function (input, options) {
		var el = makeElement.bind(input.document);
		return el(containerName,
			(options.label && [el('label',
				(input.control ? { for: getId.call(input.control) } : null),
				options.label, ':', ' ')]) || null,
			el('div', { class: 'input' }, input,
				el('span', { class: 'statuses' },
					// missing (required field) mark
					el('span', { class: 'status-missing' }, '★'),
					// validation status mark
					el('span', { class: 'status-ok' }, '✓'),
					// validation status mark
					el('span', { class: 'status-error' }, '✕')),
				// error message
				el('span', { class: 'error-message error-message-' +
					input._name.replace(/[:#\/]/g, '-') }),
				// hint
				options.hint && el('span', { class: 'hint' }, options.hint)));
	};
};
