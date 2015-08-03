# STL Models

Collection of various STL-models for testing purposes.
All models exist (if possible) in an ascii and and binary version.
Some also exist as minified ascii-version where all unnecessary whitespace is removed.


## Installation

```sh
npm install --save stl-models
```


## Usage

```js
var stlModels = require('stl-models')

stlModels
	.getObjects()
	.then console.log

stlModels
	.getByPath('polytopes/tetrahedron.ascii.stl')
	.then console.log

stlModels
	.getReadStreamByPath('polytopes/tetrahedron.ascii.stl')
	.pipe fs.createWriteStream('path/to/file')
```


## Models

### Objects

Larger objects for testing of general functionality and performance testing.

- bunny - Stanford bunny
- gearwheel - Gearwheel with 40 teeth


### Polytopes

Simple polytopes for feature testing

- cube - Cube from `[-1, -1, -1]` to `[1, 1, 1]`
- tetrahedron - Simplest valid STL model with just 4 faces
- tetrahedronMinusZero - Tetrahedron with some -0 instead of +0 values
- triangle - Just one face consisting of a isosceles triangle
- unitCube - Cube from `[0, 0, 0]` to `[1, 1, 1]`


### Misc

- multiWordName - Name of solid consists of several words


### Broken

- fourVertices.ascii - One face has 4 vertices instead of 3
- incorrectFaceCounter.bin - Number of faces and face-counter do not match
- missingFace.ascii - Model is missing 1 face
- missingNormal.ascii - Model is missing 1 normal
- quad.ascii - One face is build from a quad instead of a triangle
- singleFace.ascii - Model has only 1 face
- twoVertices.ascii - One face has 2 vertices instead of 3
- wrongHeader.bin - Header starts with "solid". This is normally reserved for ascii files only.
- wrongNormal.ascii - Model has 1 incorrect normal
- wrongNormals.ascii - Model has several incorrect normals
