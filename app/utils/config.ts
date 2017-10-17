export const config: Config = require('../resources/algorithmconfig.yml')

export interface NumberArg {
  type: 'int' | 'double' | 'oddInt'
  name: string
  defaultValue: number
  unit: string
  desc: string
}

export interface BooleanArg {
  type: 'boolean'
  name: string
  defaultValue: boolean
  desc: string
}

export interface EnumArg {
  type: 'enum'
  name: string
  defaultValue: string
  values: string[]
  desc: string
}

export type Arg = NumberArg | EnumArg | BooleanArg

export interface Config {
  cluster: {
    clusterType: string
    args: Arg[]
  }[]
  floorFixer: {
    fixerType: string
    args: Arg[]
  }[]
}
