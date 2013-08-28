# DBJS-DOM
## Two-way DOM bindings for [DBJS](https://github.com/medikoo/dbjs) objects

## Installation
### NPM

In your project path:

	$ npm install medikoo/dbjs-dom

#### Browser

You can easily bundle NPM packages for browser with [modules-webmake](https://github.com/medikoo/modules-webmake)

## Introduction

Bindings are split into two categories:

* **Text** - Text representation of a data, changes according to changes of objects
* **Input** - Interactive input controls dedicated for each type.

### Text bindings

To add bindings for basic types of DBJS engine just do:

```javascript
require('dbjs-dom/text');
```

After that each DBJS property will have implemented `toDOM` method, that will return DOM objects representing the value.

`toDOM` is environment agnostic, and needs _document_ object to be passed as first of the arguments

```javascript
var p = document.body.appendChild(document.createElement('p'));
p.appendChild(user._firstName.toDOM(document));
user._firstName.toDOMAttr(p, 'title');
```

Above describes low-level way of working with things, which it's not very effective for common dev work.
You can configure your tool of choice to detect `toDOM` functions automatically and call them behind the scenes.

It's what e.g. [`dom-ext/document/#/normalize`](https://github.com/medikoo/dom-ext/blob/master/document/%23/normalize.js) does, which is used internally by [DOMJS](https://github.com/medikoo/domjs) engine.
Therefore with DOMJS onboard, you can build templates as:

```javascript
h1({ title: article._title }, article._title);
p(article._content);
```

Additionally there's special handling provided for [DBJS-EXT's Enum type](https://github.com/medikoo/dbjs-ext#available-extensions-type-hierarchy). All extensions handling need to be required individually:

```javascript
require('dbjs-dom/text/string/string-line/enum');
```

#### Input bindings

Input binding are much more sophisticated than text bindings, they reproduce all meta characteristics of the property, whether it's _required_, whether there are some constraints like _pattern_ or _min_, _max_ values

To load bindings for basic types:

```javascript
require('dbjs-dom/input');
```

Having that, you generate input control for any mutable property:

```javascript
p.appendChild(user._firstName.toDOMInput(document));
```

You can additionally customize the input by providing additional options:

```javascript
user._firstName.toDOMInput(document, {
  required: true // force it to be required
});
```

Following options are accepted by any type of input:
* `accesskey`, `class`, `dir`, `hidden`, `id`, `intert`, `lang`, `spellcheck`, `style`, `title`, `translate`, `data-*` - HTML attributes that will be set on result DOM element.
* `name` - Overrides name of a control (it defaults to id of a property)
* `control` - Hash of options dedicated for input control element. Sometimes output DOM result in wrapper element that holds control element with some others, if we want to be sure that some options (e.g. html attributes) are targeted directly for control element, we need to pass it via `control` hash

`Boolean` type takes following additional options:
* `required` - whether control should be required (in case of checkbox it's demands that checkbox must be checked for submission)
* `type` - _radio_ or _checkbox_

`Number` type, options: `autocomplete`, `list`, `max`, `min`, `placeholder`, `readonly`, `required`, `step`.

`String` type, options: `cols`, `inputmode`, `maxlength`, `placeholder`, `readonly`, `required`, `rows`, `wrap`.

`DateTime` type, options: `autocomplete`, `list`, `max`, `min`, `readonly`, `required`, `step`.

Currently there's no defined input representation for `RegExp` and `Function` types (it will be added).

`Object` type options:
* type - _checkbox_, _select_, _edit_, _radio_:
    * _checkbox_: Is valid only for multiple values. By default multiple input is presented as list of select controls, with checkbox option, list of checkboxes with labels is output instead.
    * _select_ (default) - Object value is choosen from provided list in select box
    * _edit_ - Object value is edited with fieldset of object fields, that way we may create new object and add it as a value, or edit object that is assigned as a value.
    * _radio_. Instead of listing objects in select control, list them with radios

There are also bindings for various (where applicable) [DBJS-EXT](https://github.com/medikoo/dbjs-ext) types. 
They need to be required individually, e.g.:

```javascript
require('dbjs-dom/input/string/string-line');
```
Options for configured types:

`Date` type, it derives from `DateTime` configurations and options are same just take date instead of datetime for `min` and `max` values.

`StringLine` type, options: `autocomplete`, `dirname`, `inputmode`, `list`, `maxlength`, `pattern`, `placeholder`, `readonly`, `required`, `size`.

`Email` type, options: `autocomplete`, `list`, `maxlength`, `pattern`, `placeholder`, `readonly`, `required`, `size`.

`Enum`, type, options:
* `type` - _radio_ or _select_ (default). If you want to choose enum value with radios, pass _radio_ type
* `multiType` - _base_ or _checkbox_ (default). Strictly for multiple values, by default you choose values with checkboxes but you can choose _base_ and choose with multiple select controls (which is default multiple input representation in DBJS)

Other options are typical for chosen type of control.

`Password` type, options: `autocomplete`, `maxlength`, `pattern`, `placeholder`, `readonly`, `required`, `size`.

`Url` type, options: `autocomplete`, `list`, `maxlength`, `pattern`, `placeholder`, `readonly`, `required`, `size`.

##### Composite inputs

Few inputs can be configured in related group of controls, e.g. we can configure dynamic property that relies on few static properties, and then express it with set of composite inputs.

Predefined composite inputs can be found at https://github.com/medikoo/dbjs-dom/blob/master/input/composites/

_On how to configure composite inputs, documentation coming soon._

##### Input component

Input component is input control for one property but accompanied with label, hint, statuses (required, valid, saved), and place for error message. You can generate full input component with `toDOMInputComponent` method:

```javascript
p.appendChild(user._firstName.toDOMInputComponent(document));
```

You can override output structure, with _render_ option. See [default render function](https://github.com/medikoo/dbjs-dom/blob/master/input/_relation.js#L18-L30), to see how to configure custom function.

##### Fieldset of controls

There's dedicated utility to output fieldset of controls:

```javascript
require('dbjs-dom/input/utils/fieldset');
```

Then each object has `toDOMFieldset` method:

```
div(user.toDOMFieldset(document, {
	tag: 'personal' // Output only properties tagged as 'personal'
}));
```



