const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const nodeExternals = require('webpack-node-externals');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

module.exports = [
  {
    mode: 'production',
    target: 'node',
    entry: './src/server/server.ts',
    output: {
      path: path.resolve(__dirname, 'dist/webpack/server'),
      filename: 'server.js'
    },
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { 
                    targets: { 
                      node: '14'
                    } 
                  }],
                  '@babel/preset-typescript'
                ]
              }
            },
            'ts-loader'
          ],
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    }
  },
  
  {
    mode: 'production',
    entry: './public/sass/styles.sass',
    output: {
      path: path.resolve(__dirname, 'dist/webpack/css')
    },
    plugins: [
      new RemoveEmptyScriptsPlugin(),
      new MiniCssExtractPlugin({
        filename: 'styles.css'
      })
    ],
    module: {
      rules: [
        {
          test: /\.sass$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader'
          ]
        }
      ]
    }
  }
];