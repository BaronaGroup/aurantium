const P = require('bluebird'),
  $ = require('jquery'),
  _ = require('lodash')

const renderObject = exports.renderObject = (object, data, children, isTopLevel = true) => {
  return (object instanceof $ ? P.resolve(object) : P.resolve(object.render(data, children)))
    .then($rendered => {
      if (!($rendered instanceof $)) {
        throw new Error('Render should return a jquery object')
      }
      const $wrapper = $('<wrapper>').html($rendered)

      return initializeComponentsIn($wrapper)
        .then(() => {
          const $finalRendered = $wrapper.children()
          if (data) {
            if (data.id) {
              $finalRendered.attr('id', data.id)
            }
            if (data['class']) { // eslint-disable-line dot-notation
              const existingClasses = $finalRendered.attr('class'),
                newClasses = existingClasses ? existingClasses + ' ' + data['class'] : data['class'] // eslint-disable-line dot-notation
              $finalRendered.attr('class', newClasses)
            }
          }
          const components = $finalRendered.data('components') || {}
          components[object.prototype && object.prototype.name] = object

          $finalRendered.data('components', components)
          $finalRendered.components = components
          if (isTopLevel) {
            $finalRendered.find('.o2-object-tree-rendered-listener').add($finalRendered.filter('.o2-object-tree-rendered-listener'))
              .each(function() {
                $(this).removeClass('o2-object-tree-rendered-listener')
                $(this).data('o2-object-tree-rendered-callback') && $(this).data('o2-object-tree-rendered-callback')($(this))
              })
          }
          return $finalRendered
        })
    })
}

function initializeComponentsIn($context) {
  if ($context.is('component')) {
    return initializeComponent($context)
  }

  return new P((resolve, reject) => {
    processNextComponent()
    function processNextComponent() {
      try {
        const $component = $context.find('component:first')
        if (!$component.length) {
          resolve()
        } else {
          initializeComponent($component)
            .then(processNextComponent, reject)
        }
      } catch (ex) {
        reject(ex)
      }
    }
  })
}

function initializeComponent($component) {
  const {component: componentImpl, attributes, children} = $component.data('jsx-component')

  return renderObject(componentImpl, attributes, children)
    .then($rendered => {
      addEventHandlers($rendered)
      return $component.replaceWith($rendered)
    })

  function addEventHandlers($rendered) {
    (_.pairs || _.toPairs)(attributes).forEach(function([name, value]) {
      const [ looksLikeEventHandler, event ] = name.match(/^on(.*)$/) || []
      if (looksLikeEventHandler && _.isFunction(value)) {
        $rendered.on(event, value)
      }
    })
  }
}
