const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const devPages = {

    // Default
    
    'Index': 'index',

    // Components

    'Accordion': 'accordion',
    'Alert': 'alert',
    'Article': 'article',
    'Button': 'button',
    'Border': 'border',
    'Backdrop': 'backdrop',
    'Card': 'card',
    'Color': 'color',
    'CustomLayouts': 'custom-layouts',
    'Footer': 'footer',
    'Form': 'form',
    'GlobalNav': 'global-nav',
    'GlobalHeader': 'global-header',
    'Grid': 'grid',
    'Lightbox': 'lightbox',
    'Modal': 'modal',
    'Map' : 'map',
    'Navigation': 'navigation',
    'Spacer': 'spacer',
    'Tab': 'tab',
    'Table': 'table',
    'Typography': 'typography'
}

const devDir = './dist/html';

const devPage = `${devPages.Typography}.html`;

module.exports = merge(common, {
    mode: 'development',
    target: 'web',
    devServer: {
        hot: true,
        open: true,
        static: {
            directory: path.resolve(__dirname, devDir),
            staticOptions: {
                index: devPage
            },
        }
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            injectType: 'singletonStyleTag'
                        },
                    },
                    'css-loader',
                    { 
                        loader: 'postcss-loader'
                    },
                    'sass-loader',
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: `./${devDir}/${devPage}`,
            inject: 'body'
        })
    ]
});