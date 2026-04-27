fs = require 'fs'
path = require 'path'
findit = require 'findit2'

rootPath = path.resolve __dirname, '..'


validatePath = (filePath) ->
	if typeof filePath isnt 'string' or filePath.length is 0
		throw new Error "Invalid path: path must be a non-empty string"

	absolutePath = path.resolve rootPath, filePath

	if absolutePath.indexOf(rootPath + path.sep) isnt 0
		throw new Error "Invalid path: \"#{filePath}\" is outside of the package"

	if not fs.existsSync absolutePath
		throw new Error "Invalid path: \"#{filePath}\" does not exist"

	return absolutePath


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
		try
			absolutePath = validatePath filePath
		catch error
			reject error
			return

		fs.readFile(
			absolutePath,
			(error, fileContent) ->
				if error
					reject error
				else
					resolve fileContent
		)


getReadStreamByPath = (filePath) ->
	absolutePath = validatePath filePath
	return fs.createReadStream absolutePath


module.exports = {
	getObjects
	getByPath
	getReadStreamByPath
}
