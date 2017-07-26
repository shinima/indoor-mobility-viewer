import * as React from 'react'
import { History, Location } from 'history'
import { Component, ComponentClass } from 'react'
import * as _ from 'lodash'
import { wrapDisplayName } from 'recompose'
import * as querystring from 'querystring'

const hoistNonReactStatic = require('hoist-non-react-statics')

export type SearchParamBinding<T> = {
  location: Location
  history: History
  updateSearch: (updateMap: { [key: string]: any }, useReplace?: boolean) => void
} & T

type SearchBindDefinitions = {
  key: string
  getter?: Function
  setter?: Function
  default?: any
}[]

export default function bindSearchParameters(definitions: SearchBindDefinitions) {
  return (sourceComponent: ComponentClass) => {
    type Prop = {
      location: Location
      history: History
    }

    const targetComponent = class extends Component<Prop> {
      static displayName = wrapDisplayName(sourceComponent, 'bindSearchParameter')

      render() {
        const { location: { search }, history } = this.props
        const extraProps: { [key: string]: any } = {}
        const setters: { [key: string]: Function } = {}
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
        const updateSearch = (updateMap: { [key: string]: any }, useReplace = false) => {
          const parsed = Object.assign({}, parsedSearch)
          for (const [key, value] of Object.entries(updateMap)) {
            if (value == null) {
              delete parsed[key]
            } else {
              parsed[key] = setters[key](value)
            }
          }
          const nextSearch = `?${querystring.stringify(parsed)}`
          // 仅当search发生变化时, 更新URL
          if (search !== nextSearch) {
            if (useReplace) {
              history.replace(nextSearch)
            } else {
              history.push(nextSearch)
            }
          }
        }
        return React.createElement(sourceComponent,
          Object.assign({ updateSearch }, extraProps, this.props))
      }
    }
    hoistNonReactStatic(targetComponent, sourceComponent)
    return targetComponent
  }
}
