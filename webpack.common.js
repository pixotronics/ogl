const path = require("path");
const DtsBundleWebpack = require('dts-bundle-webpack')
const CopyPlugin = require("copy-webpack-plugin");

const SRC_PATH = path.resolve(__dirname, 'src');
const BUILD_PATH = path.resolve(__dirname, 'dist');
const PUBLIC_PATH = path.resolve(__dirname, 'public');
const LIBS_PATH = path.resolve(__dirname, 'libs');
const LIBRARY_NAME = 'ogl';
const LIBRARY_TARGET = 'umd';

const entry = {
};

entry['index'] = path.join(SRC_PATH, 'index.ts');

module.exports = {
  entry: entry,

  externals: [
    /^(ogl|\$)$/i,
    // /^(gbuffer|\$)$/i,
  ],

  output: {
    filename: '[name].js',
    path: BUILD_PATH,
    library: LIBRARY_NAME,
    libraryTarget: LIBRARY_TARGET
  },

  module: {
    rules: [
      {
        test: /\.txt$/,
        use: 'raw-loader'
      },
      {
        test: /\.vert$/,
        use: 'raw-loader'
      },
      {
        test: /\.frag$/,
        use: 'raw-loader'
      },
      {
        test: /\.glsl$/,
        use: 'raw-loader'
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
        },
      }
    ]
  },
  devServer: {
    contentBase: [PUBLIC_PATH],
    contentBasePublicPath: ['/'],
    writeToDisk: true,
    port: 8085
    //     watchContentBase: true,
  },
  resolve: {
    modules: [SRC_PATH, path.resolve(__dirname, 'node_modules'), LIBS_PATH],
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.join(SRC_PATH, 'ogl.d.ts'), to: path.join(BUILD_PATH, 'ogl.d.ts') },
      ],
    }),
    // new DtsBundleWebpack({
    //
    //   // Required
    //
    //   // name of module like in package.json
    //   // - used to declare module & import/require
    //   name: 'ogl',
    //   // path to entry-point (generated .d.ts file for main module)
    //   // if you want to load all .d.ts files from a path recursively you can use "path/project/**/*.d.ts"
    //   //  ^ *** Experimental, TEST NEEDED, see "All .d.ts files" section
    //   // - either relative or absolute
    //   main: 'dist/index.d.ts',
    //
    //   // Optional
    //
    //   // base directory to be used for discovering type declarations (i.e. from this project itself)
    //   // - default: dirname of main
    //   baseDir: 'dist',
    //   // path of output file. Is relative from baseDir but you can use absolute paths.
    //   // if starts with "~/" then is relative to current path. See https://github.com/TypeStrong/dts-bundle/issues/26
    //   //  ^ *** Experimental, TEST NEEDED
    //   // - default: "<baseDir>/<name>.d.ts"
    //   out: 'index.d.ts',
    //   // include typings outside of the 'baseDir' (i.e. like node.d.ts)
    //   // - default: false
    //   externals: false,
    //   // reference external modules as <reference path="..." /> tags *** Experimental, TEST NEEDED
    //   // - default: false
    //   referenceExternals: false,
    //   // filter to exclude typings, either a RegExp or a callback. match path relative to opts.baseDir
    //   // - RegExp: a match excludes the file
    //   // - function: (file:String, external:Boolean) return true to exclude, false to allow
    //   // - always use forward-slashes (even on Windows)
    //   // - default: *pass*
    //   // exclude: /^defs\/$/,
    //   // delete all source typings (i.e. "<baseDir>/**/*.d.ts")
    //   // - default: false
    //   removeSource: false,
    //   // newline to use in output file
    //   // newline: os.EOL,
    //   // indentation to use in output file
    //   // - default 4 spaces
    //   // indent: '    ',
    //   // prefix for rewriting module names
    //   // - default ''
    //   // prefix: '__',
    //   // separator for rewriting module 'path' names
    //   // - default: forward slash (like sub-modules)
    //   // separator: '/',
    //   // enable verbose mode, prints detailed info about all references and includes/excludes
    //   // - default: false
    //   verbose: true,
    //   // emit although included files not found. See "Files not found" section.
    //   // *** Experimental, TEST NEEDED
    //   // - default: false
    //   emitOnIncludedFileNotFound: false,
    //   // emit although no included files not found. See "Files not found" section.
    //   // *** Experimental, TEST NEEDED
    //   // - default: false
    //   emitOnNoIncludedFileNotFound: false,
    //   // output d.ts as designed for module folder. (no declare modules)
    //   outputAsModuleFolder: false,
    //   // path to file that contains the header
    //   // // insert a header in output file. i.e.: http://definitelytyped.org/guides/contributing.html#header
    //   // - default: null
    //   // headerPath: "path/to/header/file",
    //   // text of the the header
    //   // doesn't work with headerPath
    //   // // insert a header in output file. i.e.: http://definitelytyped.org/guides/contributing.html#header
    //   // - default: ''
    //   // headerTex: ""
    // })
  ]
};