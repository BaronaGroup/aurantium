var $ = require('jquery'),
  _ = require('lodash')

var undefinedElementsAllowed = false

var ClassicCitrusComponent = function() {}

module.exports = {
  createElement: createElement,
  allowUndefinedElements: function() {
    undefinedElementsAllowed = true
  },
  ClassicCitrusComponent: ClassicCitrusComponent
}

function createElement(elementType, attributes /* ...children*/) {
  attributes = attributes || {}
  var children = _.toArray(arguments).slice(2)
  if (!elementType.match) {
    if (elementType instanceof ClassicCitrusComponent) {
      var component = new elementType(attributes, children)
      component.prototype = elementType
      var $component = $('<component>')
        .data('jsx-component', {component: component, attributes: attributes, children: children})
      $component.component = component
      return $component
    } else {
      return elementType(attributes, children)
    }
  } else {
    var $element = $(document.createElement(elementType)) // eslint-disable-line no-var
    return $element
      .each(addAttributesToElement)
      .each(appendChildren)
      .each(applyMixins)
      .each(finish)
  }

  function appendChildren(){
    $(this).append(_.flatten(children).map(makeChildAppendable))
  }

  function makeChildAppendable(child) {
    if (child === undefined) {
      if (undefinedElementsAllowed) return $()
      
      throw new Error('Invalid undefined child')
    }
    if (child instanceof $ || child instanceof Text) {
      return child
    }
    else {
      return document.createTextNode(child.toString())
    }
  }

  function addAttributesToElement() {
    var $this = $(this)
    for (var key in attributes) {
      var value = attributes[key]
      if (key === 'data') {
        _.extend($this.data(), value)
      } else if (key === 'indeterminate' && $this.is('input')) {
        $this.prop('indeterminate', !!value)
      } else if (key === 'value' && $this.is('select')) {
        $this.data('__citrus_select_value', value)
      } else if (_.isFunction(value)) {
        var keyMatch = key.match(/^on(.*)$/)
        if (!keyMatch) {
          throw new Error(key + ' is a function, but the key does not look like an event handler')
        }
        var event = keyMatch[1]
        $this.on(event, value)
        if (/[A-Z]/.test(event)) {
          $this.on(event.toLowerCase(), value)
        }
      } else if (key === 'class' && _.isArray(value)) {
        $this.attr('class', _.compact(value).join(' '))
      } else if (key === 'dangerouslySetInnerHTML') {
        if (!value.__html && value.__html !== '') throw new Error('You are using dangerouslySetInnerHTML without providing an object with __html property')
        $this.html(value.__html)
      } else {
        $this.attr(key, value)
      }
    }
  }

  function finish() {
    var $this = $(this)
    var selectVal = $this.data('__citrus_select_value')
    if (selectVal !== undefined) {
      $this.val(selectVal)
    }
  }

  function applyMixins() {
    var $this = $(this)

    var mixins = attributes.mixins
    if (mixins) {
      $this.removeAttr('mixins')
      $this.data('mixins', mixins)
      _.each(mixins, function(mixin) {
        mixin.apply($this)
      })
    }
  }
}