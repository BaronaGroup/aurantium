# Aurantium JSX

Aurantium is a library that allows the usage of JSX to create jQuery objects, as opposed to React components.

This is used to provide a rich and powerful templating system for code bases that still are stuck with jQuery, and can not
feasibly be upgraded to more modern technologies.

Aurantium is **not** a recommended solution for new code bases.

 

## Requirements

Aurantium relies on existing mechanisms to convert the JSX markup into calls to React. This essentially means that
babel, webpack or something similar needs to be used. Aurantium itself is implemented using ES5 features, so ES2016+ support
is not needed.

### Browser compatibility

Aurantium is known to work in all modern browsers.

IE7 is not supported, although an earlier development branch does exist with somewhat limited IE7 support. You probably
don't want it, but it is available from the repository as the `ie7` branch.

## Usage

Once everything has been set up, using Aurantium is quite straightforward. The main thing to note is that with Aurantium all
JSX fragments it is applied to return detached jQuery objects, which can be inserted into the actual DOM.

In order to use Aurantium for interpreting your JSX, the `React` variable in your scope must refer to Aurantium. In practice this
tends to be done by setting the value global `React` variable to the value returned by `require('aurantium')` returns. 

    window.React = require('aurantium')

This is something you probably don't want to do if parts of your code base use React, or if you dislike global variables
(as you generally should). So as an alternative you can of course just do this in every file that contains JSX:

    const React = require('aurantium')
    
### Configuration

#### undefinedElementsAllowed

By default aurantium will throw an exception if you attempt to insert `undefined` into the object tree. This is because this
is typically a bug, and simply rendering it as an empty string can easily conceal them.

If your preference is to allow undefined values to be interpreted as empty strings, you can just do this

    require('aurantium').undefinedElementsAllowed = true
    
### A few simple examples

    $('body').append(<h1>Hello, world!</h1>)
    
    return (
        <div class="head">
            <h1>Hello, world</h1>
        </div>
    )   
    
Since the JSX fragments represent jQuery objects, we can also do things like

    (<div />).on('click', '.filter', eventHandler).appendTo($('body'))
    
More examples may be added to the repository later on.
    

## Syntax

With Aurantium JSX you can write your markup just as you would with HTML, just noting that all tags must be closed.
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
    
    const html = '<img src="chicken.png">'
    const $element = <div dangerouslySetInnerHTML={{__html: html}} />
    
### Nothing

Sometimes it is useful to be able to insert nothing from JSX. There are two common options for this, empty jQuery objects
and empty strings.

    const $div = <div>
        <span>{value ? value : ''}</span>
        <span>{value ? value : $()}</span>
    </div>
    
Empty jQuery object could be considered the preferred option, as it doesn't create an empty text node, so it is guaranteed
not to produce anything on any browser. So far no problems have been observed with the empty string either.
    
### Mixins

Mixins are a consistent way to enhance the functionality of existing elements. They are most commonly used for things such as
validation, automatically saving the values of an input and so on.

Mixins are given to any element using the `mixins` attribute, and its value should be an array of mixins.

A mixin is either a function, or an object with the function behin the key `apply`. Once the element
containing the mixin is rendered (not to the actual DOM, just in-memory detached elements) the function
is called with the rendered element as its `this`. A single mixin can be used on multiple elements.

    const validate = function() {
        $(this).on('change', validateInput(this))
    }
    
    const $input = <form>
        <input name="firstname" mixins={[validate]} />
        <input name="lastname" mixins={[validate]} />
    </form>


### Functions

In JSX elements that start with lowercase letters are considered to be dumb elements, whereas those that start with a capital
letter are considered to be smarter, which refer to variables in scope. In aurantium, these smarter elements are expected 
to be functions. These functions get two parameters - a map of all attributes and an array of all of its children.

There is no automatic processing of attributes or immediate children for these functions.

The function is expected to return whatever it wants inserted into the object tree.

Example 1: Foo uses neither attributes nor children, so the two are equivalent:

    function Foo() { return "Bar" }
    
    const $element = <span><Foo /></span>
        $element2 = <span>{Foo()}</span> 
        
    // Result: <span>Bar</span>
    
Example 2: Name uses attributes, so the two are equivalent:

    function Name(attrs) { return attrs.firstName + ' ' + attrs.lastName }
    
    const $element = <span><Name firstName="Bob" lastName="SBT" /></span>,
        $element2 = <span>{Name({firstName: 'Bob', lastName: 'SBT')}</span>
        
Example 3: Children as well

    function Foo(attrs, children) {
        return <div>
            <h1>{attrs.title}</h1>
            {children}
        </div>
    }
    
    const $element = <Foo title="Hello, world">
            <p>How are you doing?</p>
            <button>Great!</button>
        </Foo>
        
    /* Result:
     *  <div>
     *      <h1>Hello, world</h1>
     *      <p>How are you doing?</p>
     *      <button>Great!</button>
     *  </div>
     */
            
    
    
As long as you stick to functions you could theoretically do a completely different DSL using JSX.
    
### Plugin: Translations

Note: this only applies to internal users of Aurantium, in code bases that have aurantium-translation support built in.

T translations can be used directly as children of JSX elements. As it is the support for this is hard coded and should be
replaced with a more generic interface for a public release.

When a translation is the sole child of an element, the in-place translation editor works fully.

    const html = <span>{T('context.translationkey')}</span>

It is possible to mix the translation with other children at a slight loss of development time functionality.    

    const html = <span>Text: {T('context.translationkey')}</span>
    

### Components

While aurantium was originally conceived using a component-based model, in practice it has turned out that using
functions takes care of the same thing faster, with fewer things to know/remember/discover, and with minimal effect
on the actual modularity with proper coding standards.

Aurantium components as they were are considered obsolete at this time, and were removed for the first public aurantium release.

## Plugins

There are a few extension points in aurantium. They are not intented to be anywhere near complete at this time -- they exist simply
to allow for more generic solutions for problems that had hard-coded solutions suitable only for internal use.

### Child transformers

Child transformers convert objects you've inserted into elements you can insert into the DOM - this means either
jQuery object, textNode or anything that'll produce the text you want (not HTML!) via `.toString()`.

Every object that is neither a jQuery object nor a textNode goes through all child transformers in their definition order.
If the object was replaced by any of the transformed, without resulting in a jQuery object or a text node the
process is restarted. If no transformer replaced the object, its `toString` will be called.

    require('aurantium').childTransformers.push(function(child, $parent) {
        if (child instanceof MyClass) {
            return child.toJquery()
        }
        return child // you should usually return the child if it wasn't something you can handle
    })
    
The function also has access to the parent object, which allows you to make changes to it if needed.

If your object is meant to change the parent and then to be ignored, you should return `$()` from the transformer.

### Attribute handlers

If you want to add your own custom attributes, or custom handling of a value for an attribute, attribute handlers
can help you out.

Essentially every attribute in the JSX goes through processing; those that have built in meanings can not be overridden,
but the rest go through attribute handlers.

It is assumed that at most one handler will take care of any given attribute. If no handler took care of one, it
is simply added as an attribute to the element itself.

The handlers should return true if they handled the given attribute, or a falsy value of they did not.

    require('aurantium').attributeHandlers.push(function($element, name, value) {
        if (name === 'valueOverride') {
            $element.attr('value', value)
            return true
        }
        // implicitly returning undefined is fine to indicate the attribute was not handled
    })