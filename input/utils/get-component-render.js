'use strict';

var makeElement = require('dom-ext/document/#/make-element')
  , getId       = require('dom-ext/html-element/#/get-id')
  , i18nToDom   = require('i18n2-md-to-dom')
  , memoize     = require('memoizee/weak-plain')

  , inlineMdiOption = { inline: true };

var getMd = memoize(function (document, mdiOptions) {
	var mdi = i18nToDom(document);
	return function (message) { return mdi(message, mdiOptions); };
});

module.exports = function (containerName) {
	return function (input, options) {
		var el = makeElement.bind(input.document)
		  , mdi = getMd(input.document, inlineMdiOption)
		  , md = getMd(input.document);

		return el(containerName, { class: options.class },
			(options.label && [el('label',
				(input.control ? { for: getId.call(input.control) } : null),
				options.label, ' ')]) || null,
			el('div', { class: 'input' }, input,
				// info tooltip
				options.optionalInfo && el('div', { class: 'input-optional-info' },
					el('span', { class: 'fa fa-info-circle' }, "Info"),
					el('div', { class: 'input-optional-info-content' },
						typeof options.optionalInfo === 'string' ? md(options.optionalInfo)
							: options.optionalInfo)),
				// statuses
				options.disabled ? null : el('span', { class: 'statuses' },
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
				options.hint && el('span', { class: 'hint' },
					typeof options.hint === 'string' ? mdi(options.hint) : options.hint)));
	};
};
