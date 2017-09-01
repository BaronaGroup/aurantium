# Citrus JSX

Citrus is a library that allows the usage of JSX to create jQuery objects, as opposed to React components.

This is used to provide a rich and powerful templating system for code bases that still are stuck with jQuery, and can not
feasibly be upgraded to more modern technologies.

Citrus is **not** a recommended solution for new code bases.

 

## Requirements

Citrus relies on existing mechanisms to convert the JSX markup into calls to React. This essentially means that
babel, webpack or something similar needs to be used. Citrus is implemented using ES2016 features, so even if your code
base does not to do so, you may want to set up babel/webpack to do es2016 to es2015 conversion as well for 
increased compatibility.

### Browser compatibility

Citrus is known to work in all modern browsers.

A special `ie7` branch exists for IE7 support, which avoids constructs that combining babel es2016 to es2015 and es5shim
do not convert into compatible forms.

## Usage

Once everything has been set up, using Citrus is quite straightforward. The main thing to note is that with Citrus all
JSX fragments it is applied to return detached jQuery objects, which can be inserted into the actual DOM.

In order to use Citrus for interpreting your JSX, the `React` variable in your scope must refer to Citrus. In practice this
tends to be done by setting the value global `React` variable to whatever requiring Citrus' `jsx.js` returns. Of course you
could just locally do something along the lines of

    const React = require('../citrus/jsx')
    
    
In a public release, citrus of course would be a node module.

### A few examples

    $('body').append(<h1>Hello, world!</h1>)
    
    return (
        <div class="head">
            <h1>Hello, world</h1>
        </div>
    )   
    
Since the JSX fragments represent jQuery objects, we can also do things like

    (<div />).on('click', '.filter', eventHandler).appendTo($('body'))
    

## Syntax

With Citrus JSX you can write your markup just as you would with HTML, just noting that all tags must be closed.
There are however a few shortcuts that can be used to make certain things easier.

### Arrays

If a child to an element is an array, all of the items are instead appended to the element.

    const $element = <div>{[<span>1</span><span>2</span>]}</div>
    
Outputs the same kind of element hieararchy as:

    const $element = <div>
        <span>1</span>
        <span>2</span>
    </div> 

Of course, used like that arrays do not do anything useful, but combined with map you can accomplish a lot of things.

    const items = ['hamburger', 'pizza', 'burrito', 'chicken wings']
    const $element = <form>
        {items.map(item => <label><input type="checkbox" name={item} /> {item}</label>
    </form>
    

### Classes

As with HTML, you use the `class` attribute to define classes; unlike with React, `className` is not used for this purpose.

    const $element = <div class="small">text</div>
    
It is common for some of the classes to be set up in a dynamic fashion. Using string concatenation is an option, just as one would expect.

    const classes = "small " + extraClass
    const $element = <div class={classes}>text</div>
    const $element2 = <div class={`small ${extraClass}`}>text</div>
    
Alternatively it is possible to use an array for the classes instead.

    const $element = <div class={['small', extraClass]} />
    
Falsy values are ignored, so having undefined of empty classes if just fine. It also allows for an easy way to have conditional classes:

    const $element = <div class={['small', condition && 'red']} />
    
### Data attributes

You can use the usual `data-namehere` attributes without issues
 
    const $element = <div data-id="123" />
    console.log($element.data('id')) // '123'
    
You can also use the `data` attribute itself, and give it an object. This allows for much more diverse forms of data to
be presented -- normally you are limited to strings, using this functionality you can include anything you want.

    const $element = <div data={{ id: 123, log: function() { console.log('div')  }}   
    
### Event handlers

Event handlers are added using the oneventname or onEventname attributes.

All of the following add `handleClick` as the event handler for `click` event:

    const $element = <div onclick={handleClick} />
    const $element = <div onClick={handleClick} />
    const $element = <div />.on('click', handleClick)
    
It should be noted that `onClick={handleClick}` **also** adds a handler for `Click` event (with a capital C).

### Indeterminate checkboxes

Checkboxes have the attribute `intedeterminate`, which, when set to a truthy value, activates the indeterminate mode of
checkboxes. Normally this functionality is not available through HTML at all, and has to be done via the DOM.

    const $input = <input type="checkbox" indeterminate={true} />
    
### Default value of selects

You can still use the `selected` attribute of an option to set up the default value for a select, but you can alternatively set
the `value` attribute of the select itself to match a key of the option.
 
    const $select = <select>
        <option key="a">a</option>
        <option key="b" seleced>b</option>
    </select>
     
    const $select2 = <select value="b">
        <option key="a">a</option>
        <option key="b">b</option>
    </select>
    
This allows the code that generates the options to be generic and without care of which one should be selected.

### Setting HTML directly

In a fashion consistent with React, the attribute dangerouslySetInnerHTML is used to set the HTML content of an element
directly from a string. The value of the attribute should be an object containing a __html property, which in turn contains
the actual HTML markup. 
    
    const html '<img src="chicken.png">'
    const $element = <div dangerouslySetInnerHTML={{__html: html}} />
    
### Translations

The T translations can be used directly as children of JSX elements. As it is the support for this is hard coded and should be
replaced with a more generic interface for a public release.

When a translation is the sole child of an element, the in-place translation editor works fully.

    const html = <span>{T('context.translationkey')}</span>

It is possible to mix the translation with other children at a slightl loss of development time functionality.    

    const html = <span>Text: {T('context.translationkey')}</span>
    

### Components

Components are supported, as it is the preferred way to modularize your markup is with the use of other
abstractions, such as with the use of modules and functions.

Alternatively a more fully featured component implementation needs to be implemented, as the current one
only provides very limited benefits over the use of functions.
