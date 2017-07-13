import React, { Component } from 'react'
import _ from 'lodash'
import wrapDisplayName from 'recompose/wrapDisplayName'
import hoistNonReactStatic from 'hoist-non-react-statics'
import querystring from 'querystring'

export default function bindSearchParameters(definitions) {
  return (sourceComponent) => {
    const targetComponent = class extends Component {
      static displayName = wrapDisplayName(sourceComponent, 'bindSearchParameter')

      render() {
        const { location: { search }, history } = this.props
        const extraProps = {}
        const setters = {}
        const parsedSearch = querystring.parse(search.substring(1))
        for (const {
        key, getter = _.identity, setter = String, default: defaultValue,
      } of definitions) {
          if (parsedSearch[key] === undefined) {
            extraProps[key] = defaultValue
          } else {
            extraProps[key] = getter(parsedSearch[key])
          }
          setters[key] = setter
        }
        const updateSearch = (updateMap) => {
          const parsed = Object.assign({}, parsedSearch)
          for (const [key, value] of Object.entries(updateMap)) {
            if (value == null) {
              delete parsed[key]
            } else {
              parsed[key] = setters[key](value)
            }
          }
          history.push(`?${querystring.stringify(parsed)}`)
        }
        return React.createElement(sourceComponent,
          Object.assign({ updateSearch }, extraProps, this.props))
      }
    }
    hoistNonReactStatic(targetComponent, sourceComponent)
    return targetComponent
  }
}
