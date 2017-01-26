# DBJS-DOM
## DOM bindings for [DBJS](https://github.com/medikoo/dbjs) objects

## Installation
### NPM

In your project path:

	$ npm install medikoo/dbjs-dom

#### Browser

To port it to Browser or any other (non CJS) environment, use your favorite CJS bundler. No favorite yet? Try: [Browserify](http://browserify.org/), [Webmake](https://github.com/medikoo/modules-webmake) or [Webpack](http://webpack.github.io/)

## Introduction

Bindings are split into two categories:

* **Text** - Text representation of a data, changes according to changes of objects
* **Input** - Interactive input controls dedicated for each type.

### Text bindings

To add bindings for basic types of DBJS engine just do:

```javascript
require('dbjs-dom/text')(db); // db is your DBJS database instance
```

After that each DBJS property observable will have implemented `toDOM` method, that will return DOM objects representing the value.

`toDOM` is environment agnostic, and needs _document_ object to be passed as first of the arguments.
```javascript
var p = document.body.appendChild(document.createElement('p'));
p.appendChild(user._firstName.toDOM(document));
user._firstName.toDOMAttr(p, 'title');
```

Above describes low-level way of working with things, which it's not very effective for common dev work.
You can configure your tool of choice to detect `toDOM` functions automatically and call them behind the scenes, e.g. it's already supported by [domjs](https://github.com/medikoo/domjs#domjs), with which you an work as follows:

```javascript
h1({ title: article._title }, article._title);
p(article._content);
```

Additionally to basic type bindings there's a special handling provided for [DBJS-EXT's Enum type](https://github.com/medikoo/dbjs-ext#available-extensions-type-hierarchy). All extensions handling need to be required individually:

```javascript
require('dbjs-dom/text/enum')(EnumType);
```

### Input bindings

Input binding are more complex than text bindings, as producing a form input control they resolve from all meta characteristics of a property.

To load bindings for basic types do

```javascript
require('dbjs-dom/input')(db); // db is your DBJS database instance
```

Having that, you generate reactive input control for any mutable property:

```javascript
p.appendChild(user._firstName.toDOMInput(document));
```

You can additionally customize the input by providing additional options:

```javascript
user._firstName.toDOMInput(document, {
  required: true // force it to be required, even though it's not required in model
});
```

#### Possible Input configurations:

##### Options applicable to all kind of inputs

* `accesskey`, `class`, `dir`, `hidden`, `id`, `insert`, `lang`, `spellcheck`, `style`, `title`, `translate`, `data-*` - HTML attributes that will be set on result DOM element.
* `name` - Overrides name of a control (it defaults to id of a property)
* `control` - Hash of options dedicated for input control element. Sometimes DOM result does not contain only pure form controls, but it comes with some needed surrounding. if we want to be sure that some options (e.g. HTML attributes) are targeted directly for control element, we need to pass it via `control` hash
* `controls` - If input is build of out many controls (e.g. radio list), then with `controls` hash we may pass options per control individually (e.g. in case of `radio` with `options.controls.foo = {..}` we will pass options for _radio_ with name `'foo'`.

###### `Boolean` type

By default represented with `input[type=radio]` controls

* `type` - When set to `'checkbox'`, property will be represented with `input[type=checkbox]` control
* `required` - In case of `'checkbox'` type, forcing it to true demands that checkbox must be checked for submission
* `trueLabel`, `falseLabel` (`radio` only), Labels to show, which by default are read from property descriptor or type

###### `Number` type

By default represented with `input[type=number]`

- `autocomplete`, `list`, `readonly` - An HTML attributes
- `max`, `min`, `placeholder` (in model: `inputPlaceholder`), `required`, `step`. - A HTML attributes for which default values are read from property descriptor or Type

###### `Percentage` type

Binding needs to be additionally loaded via:

```javascript
require('dbjs-dom/input/number/percentage')(db);
```

By default represented with `input[type=number]`

Internally follows logic for `Number` but ensures that `1%` is exposed as `1` and not `0.01` as it would happen using normal `Number` binding

###### `Time` type

Binding needs to be additionally loaded via:

```javascript
require('dbjs-dom/input/number/integer/u-integer/time')(db);
```

By default represented with `input[type=time]`

Internally extends `DateTime` DOM binding, so same options apply

###### `String` type

By default represented with `textarea`

- `inputmode`, `readonly`, `wrap` - An HTML attributes
- `cols` (in model: `inputCols`), `maxlength` (in model: `max`), `placeholder` (in model: `inputPlaceholder`),  `required`, `rows` (in model: `inputRows`) - An HTML attributes for which default values are read from property descriptor or Type

###### `StringLine` type

Binding needs to be additionally loaded via:

```javascript
require('dbjs-dom/input/string/string-line')(db);
```

By default represented with `input[type=text]`

- `autocomplete`, `dirname`, `inputmode`, `list`, `readonly`
- `maxlength` (in model: `max`), `pattern`, `placeholder` (in model: `inputPlaceholder`), `required`, `size` (in model `inputSize`) - An HTML attributes for which default values are read from property descriptor or Type

###### `Email` type

Binding needs to be additionally loaded via:

```javascript
require('dbjs-dom/input/string/string-line/email')(db);
```

By default represented with `input[type=email]`

- `autocomplete`, `inputmode`, `list`, `readonly`
- `maxlength` (in model: `max`), `pattern`, `placeholder` (in model: `inputPlaceholder`), `required`, `size` (in model `inputSize`) - An HTML attributes for which default values are read from property descriptor or Type

###### `Password` type

Binding needs to be additionally loaded via:

```javascript
require('dbjs-dom/input/string/string-line/password')(db);
```

By default represented with `input[type=password]`

- `autocomplete`, `readonly`
- `maxlength` (in model: `max`), `pattern`, `placeholder` (in model: `inputPlaceholder`), `required`, `size` (in model `inputSize`) - An HTML attributes for which default values are read from property descriptor or Type

###### `Url` type

Binding needs to be additionally loaded via:

```javascript
require('dbjs-dom/input/string/string-line/url')(db);
```

By default represented with `input[type=url]`

- `autocomplete`, `list`, `readonly`
- `maxlength` (in model: `max`), `pattern`, `placeholder` (in model: `inputPlaceholder`), `required`, `size` (in model `inputSize`) - An HTML attributes for which default values are read from property descriptor or Type

###### Enum type

Binding needs to be additionally loaded via:

```javascript
require('dbjs-dom/input/enum')(db);
```

By default represented with `select`

* `type` - _radio_ or _select_ (default). If you want to choose enum value with radios, pass _radio_ type
* `multiType` - (_multiple_ only), _base_ or _checkbox_ (default). Strictly for multiple values, by default you choose values with checkboxes but you can choose _base_ and choose with multiple select controls (which is default multiple input representation in DBJS)
* `only` - Provide filtered list of options to display (as set, can be observable)
* `labels` - Map of eventual custom labels for items
* `group` - (_select_ only) Provide grouping instruction (will generate select with options grouped with `<optgroup>` element). `group` is a hash object with following properties:
  * `name` - Name of enum meta property, at which name of group can be retrieved
	* `set`- Map of group labels e.g. `{ group1: "Label for group 1", ... }`
* `append` - (_select_ only) Extra select options to be DateTime.

###### `DateTime` type

By default represented with `input[type=datetime-local]`

- `autocomplete`, `list`, `readonly` - An HTML attributes.
- `max`, `min`, `required`, `step` - An HTML attributes for which default values are read from property descriptor or Type

###### `Date` type

Binding needs to be additionally loaded via:

```javascript
require('dbjs-dom/input/date-time/date')(db);
```

By default represented with `input[type=date]`

- `autocomplete`, `list`, `readonly` - An HTML attributes.
- `max`, `min`, `required`, `step` - An HTML attributes for which default values are read from property descriptor or Type

###### `Object` type

By default represented with `select` in which all type instances are listed.

* `type` - Possible options are:
    * `checkbox`: (_multiple_ only), by default multiple input is presented as list of select controls, while with checkbox option, list of checkboxes with labels is output instead.
    * `select`: (default) - Object value is chosen from provided list in select box
    * `edit` - Object value is edited with fieldset of object fields, that way we may create new object and add it as a value, or edit object that is assigned as a value.
    * `radio`. Instead of listing objects in select control, we list them with radios
* `list` - (only _select_ and _radio_) - Custom (most likely filter) list of objects to display, can be observable set or array, Otherwise an array of items
* `compare` - (only _select_ and _radio_) - Function used to establish order of items. Has no effect with `list` option.
* `getOptionLabel` - (only _select_) - Custom label resolver (function) for item
* `property` - (only _select_ and _radio_) Object property from which label for item should be resolved

##### Composite inputs

Few inputs can be configured in related group of controls, e.g. we can configure dynamic property that relies on few static properties, and then express it with set of composite inputs.

Predefined composite inputs can be found at https://github.com/medikoo/dbjs-dom/blob/master/input/composites/

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
