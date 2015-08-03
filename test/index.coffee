fs = require 'fs'
path = require 'path'
assert = require 'assert'
readdirp = require 'readdirp'

stlModels = require '../source/index'
numberOfModels = 35
rootPath = path.resolve  __dirname, '..'


checkLength = (models) ->
	assert.equal models.length, numberOfModels

runTest = (file) ->
	assert file.startsWithSolid


describe 'STL Models', () ->

	testedFiles = []

	before (done) ->

		readdirp(
			{
				root: rootPath
				fileFilter: '*.stl'
			}
			() -> # Do nothing
			(error, result) ->
				if error then throw error

				testedFiles = result.files.map (file) ->

					buffer = new Buffer 5

					fileDescriptor = fs.openSync(
						file.fullPath
						'r'
					)

					fs.readSync(
						fileDescriptor
						buffer
						0
						5
						0
					)

					file.startsWithSolid = buffer.toString('utf-8') is 'solid'

					return file

				done()
		)


	it 'All .ascii.stl files start with "solid"', ->
		testedFiles
			.filter (file) -> /.*ascii\.stl/.test file.name
			.forEach (file) ->
				assert file.startsWithSolid, file.name


	it 'All .bin.stl files do not start with "solid"', ->
		testedFiles
			.filter (file) ->
				/.*bin\.stl/.test file.name and
				file.name isnt 'wrongHeader.bin.stl'
			.forEach (file) ->
				assert.equal(
					file.startsWithSolid
					false
					"File #{file.name} should not start with 'solid'"
				)


	it 'Returns a promise which resolves to a list of STL model objects', () ->
		return stlModels
			.getObjects()
			.then (models) ->

				absolutePath = models[0].absolutePath
				relativePath = models[0].absolutePath

				checkLength models
				assert models[0].filename
				assert(
					relativePath
					models[0].relativePath + ' is no relative path'
				)
				assert(
					absolutePath && absolutePath[0] is '/'
					models[0].absolutePath + ' is no absolute path'
				)


	it 'Returns a promise
		which resolves to the file content of an STL model', () ->
		return stlModels
			.getByPath 'polytopes/tetrahedron.ascii.stl'
			.then (contentBuffer) ->
				/^solid tetrahedron/.test contentBuffer


	it 'Returns a readable STL stream', (done) ->
		relativePath = 'polytopes/tetrahedron.ascii.stl'
		tempFilePath = path.join __dirname, 'temp.stl'
		writeStream = fs.createWriteStream tempFilePath

		stlModels
			.getReadStreamByPath relativePath
			.pipe writeStream

		writeStream.on 'error', -> done
		writeStream.on 'finish', ->
			assert.equal(
				String fs.readFileSync path.join rootPath, relativePath
				String fs.readFileSync tempFilePath
			)
			fs.unlinkSync tempFilePath
			done()
