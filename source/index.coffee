fs = require 'fs'
path = require 'path'

Promise = require('es6-promise').Promise
findit = require 'findit2'

rootPath = path.resolve __dirname, '..'


getAbsolutePaths = ->
	return new Promise (resolve, reject) ->

		finder = findit rootPath
		files = []

		finder.on 'error', (error) ->
			reject error

		finder.on 'directory', (directory, stat, stop) ->
			base = path.basename directory

			if base is '.git' or base is 'node_modules'
				stop()

		finder.on 'file', (file) ->
			if /stl$/.test file
				files.push file

		finder.on 'end', ->
			resolve files

getPaths = () ->
	return getAbsolutePaths().then (paths) ->
		paths.map (filePath) ->
			filePath.substr rootPath.length + 1

getNames = () ->
	return getAbsolutePaths().then (paths) ->
		paths.map (filePath) ->
			path.basename filePath

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
	getAbsolutePaths
	getPaths
	getNames
	getByPath
}
