const replace = require('rollup-plugin-replace')
const buble = require('rollup-plugin-buble')
const banner = require('./banner')
const pack = require('../package.json')
const vue = require('rollup-plugin-vue')
const path = require('path')
const node = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')

function toUpper (_, c) {
  return c ? c.toUpperCase() : ''
}

const classifyRE = /(?:^|[-_\/])(\w)/g

function classify (str) {
  return str.replace(classifyRE, toUpper)
}

const moduleName = classify(pack.name)

const entries = {
  commonjs: {
    entry: 'src/index.js',
    dest: `dist/${pack.name}.common.js`,
    format: 'cjs',
    banner
  },
  esm: {
    entry: 'src/index.js',
    dest: `dist/${pack.name}.esm.js`,
    format: 'es',
    banner
  },
  production: {
    entry: 'src/index.js',
    dest: `dist/${pack.name}.min.js`,
    format: 'umd',
    env: 'production',
    moduleName,
    banner
  },
  development: {
    entry: 'src/index.js',
    dest: `dist/${pack.name}.js`,
    format: 'umd',
    env: 'development',
    moduleName,
    banner
  },
  mixin: {
    entry: 'src/message-extractor-mixin.js',
    dest: 'dist/message-extractor-mixin.js',
    format: 'umd',
    env: 'development',
    moduleName: moduleName + 'Mixin',
    banner
  },
  foundationUmd: {
    entry: 'src/templates/foundation6.vue',
    dest: `dist/templates/foundation6.min.js`,
    format: 'umd',
    env: 'production',
    moduleName: moduleName + 'Foundation6Template',
    banner
  },
  bootstrapUmd: {
    entry: 'src/templates/bootstrap3.vue',
    dest: `dist/templates/bootstrap3.min.js`,
    format: 'umd',
    env: 'production',
    moduleName: moduleName + 'Bootstrap3Template',
    banner
  }
}

function genConfig (opts) {
  const config = {
    entry: opts.entry,
    dest: opts.dest,
    format: opts.format,
    banner: opts.banner,
    moduleName: opts.moduleName || moduleName,
    exports: 'named',
    plugins: [
      vue(),
      buble({
        transforms: { dangerousForOf: true }
      }),
      node({
        module: true
      })
    ]
  }

  const replacePluginOptions = { '__VERSION__': pack.version }
  if (opts.env) {
    replacePluginOptions['process.env.NODE_ENV'] = JSON.stringify(opts.env)
  }
  config.plugins.push(replace(replacePluginOptions))

  return config
}

exports.getEntry = name => genConfig(entries[name])
exports.getAllEntries = () => Object.keys(entries).map(name => genConfig(entries[name]))
