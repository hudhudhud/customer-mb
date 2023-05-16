var path = require('path')
var CompressionPlugin = require('compression-webpack-plugin');
module.exports = {
	publicPath: '',
	// 不需要生产环境的 source map，将其设置为 false 以加速生产环境构建
	productionSourceMap: false,
	devServer: {
		open: true,
		port: '9501'
	},
	configureWebpack: config => {
		if (process.env.NODE_ENV === 'production') {
			// 为生产环境修改配置...
			// config.plugins = [...config.plugins, ...plugins]
		}
		
		config.module.rules.push(
			{
				//兼容ios9
				test: /\.js$/,
				include: [
					// path.resolve('node_modules/'),//以防有遗漏，直接包含整个node_module
					//ios9报错const语法，本地app.js中找到用const的包
					path.resolve('node_modules/dom7/dist/dom7.modular.js'),
					path.resolve('node_modules/uppercamelcase/index.js'),
					path.resolve('node_modules/camelcase/index.js'),
				],
				// exclude:[
				//     path.resolve('node_modules/element-ui'),
				// ],
				use: {
					loader: 'babel-loader',
					options: {
							cacheDirectory:true,
							presets: ['@babel/preset-env'],
							// plugins: ['@babel/transform-runtime']
					}
				}
			}
		)
		//开启gizp压缩,在服务器配置开启gzip，请求会优先匹配同文件名的gz压缩格式返回
		// config.plugins.push(new CompressionPlugin({
		//     test: /\.js$|\.css$/,
		// })) 
	},
	transpileDependencies: ["swiper", "vue-awesome-swiper"],
	filenameHashing: true //默认为true,mode不为developer模式下，才生效(NODE_ENV='production')
}
