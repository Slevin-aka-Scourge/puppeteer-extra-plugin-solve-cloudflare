export interface Provider {
  id?: string
  token?: string
}
export interface PluginOptions {
  provider:Provider,
  debug?:boolean
}
