const $ = require('jquery'),
  _ = require('lodash')

let Translation

const ReactReplacement = {
  createElement
}

exports.configure = function(options) {
  window.React = ReactReplacement
  Translation = options.Translation
}

function createElement(elementType, attributes, ...children) {
  if (!Translation) throw new Error('JSX must be configured before the first JSX object definition.')
  attributes = attributes || {}
  if (!elementType.match) {
    const component = new elementType(attributes, children)
    component.prototype = elementType
    const $component = $('<component>')
      .data('jsx-component', {component: component, attributes: attributes, children: children})
    $component.component = component
    return $component
  } else {
    var $element = $(document.createElement(elementType)) // eslint-disable-line no-var
    return $element
      .each(addAttributesToElement)
      .each(appendChildren)
      .each(applyMixins)
      .each(translateIfNeeded)
      .each(finish)
  }

  function appendChildren() {
    if (children.length === 1 && children[0] instanceof Translation) {
      $(this).text(children[0])
    } else {
      $(this).append(_.flatten(children).map(makeChildAppendable))
    }
  }

  function makeChildAppendable(child) {
    if (child === undefined) {
      throw new Error('Invalid undefined child')
    }
    if (child instanceof $ || child instanceof Text) {
      return child
    }
    else {
      if (child instanceof Translation) {
        child.context = $element
      }
      return document.createTextNode(child.toString())
    }
  }

  function addAttributesToElement() {
    const $this = $(this)
    for (let key in attributes) {
      const value = attributes[key]
      if (key === 'data') {
        _.extend($this.data(), value)
      } else if (key === 'value' && $this.is('select')) {
        $this.data('__citrus_select_value', value)
      } else if (_.isFunction(value)) {
        const [ looksLikeEventHandler, event ] = key.match(/^on(.*)$/)
        if (!looksLikeEventHandler) {
          throw new Error(key + ' is a function, but the key does not look like an event handler')
        }
        $this.on(event, value)
      } else if (key === 'class' && _.isArray(value)) {
        $this.attr('class', _.compact(value).join(' '))
      } else {
        if (value instanceof Translation) value.context = $this
        $this.attr(key, value)
      }
    }
  }

  function finish() {
    const $this = $(this)
    const selectVal = $this.data('__citrus_select_value')
    if (selectVal !== undefined) {
      $this.val(selectVal)
    }
  }

  function applyMixins() {
    const $this = $(this)

    const mixins = attributes.mixins
    if (mixins) {
      $this.removeAttr('mixins')
      $this.data('mixins', mixins)
      _.each(mixins, function(mixin) {
        mixin.apply($this)
      })
    }
  }

  function translateIfNeeded() {
    const translationKey = $(this).data('i18n')
    if (translationKey) $(this).text(new Translation(translationKey))
  }

}
