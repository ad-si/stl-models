fs = require 'fs'
path = require 'path'

Promise = require('es6-promise').Promise
findit = require 'findit2'

rootPath = path.resolve __dirname, '..'


getObjects = ->
	return new Promise (resolve, reject) ->

		finder = findit rootPath
		files = []

		finder.on 'error', (error) ->
			reject error

		finder.on 'directory', (directory, stat, stop) ->
			base = path.basename directory

			if base in ['node_modules', '.git', 'source', 'test']
				stop()

		finder.on 'file', (file) ->
			if /stl$/.test file
				files.push {
					filename: path.basename file
					absolutePath: file
					relativePath: file.substr rootPath.length + 1
				}

		finder.on 'end', ->
			resolve files


getByPath = (filePath) ->
	return new Promise (resolve, reject) ->
		fs.readFile(
			path.join(rootPath, filePath),
			(error, fileContent) ->
				if error
					reject error
				else
					resolve fileContent
		)


module.exports = {
	getObjects
	getByPath
}
