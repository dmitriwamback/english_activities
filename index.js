let mainCanvas = document.getElementById("background-i")
let mainCanvasGL = mainCanvas.getContext('webgl', {depth: true, antialiasing: true})

if (mainCanvasGL == null)
    mainCanvasGL = mainCanvas.getContext('webgl2', {depth: true, antialiasing: true})
mainCanvasGL.clearColor(0, 0, 0, 1.0)

mainVertex = `

attribute vec3 vertex;
attribute vec3 normal;

uniform mat4 projection;
uniform mat4 lookAt;
varying vec3 n;

void main() {
    n = normal;
    gl_Position = projection * lookAt * vec4(vertex, 1.0);
    gl_PointSize = 8.0;
}
`
mainFragment = `
precision mediump float;
varying vec3 n;

uniform vec3 col;
void main() {
    gl_FragColor = vec4(col, 255.0) / 255.0;
}
`













var p = [], permutation = [ 151,160,137,91,90,15,
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    ]
for (var i=0; i < 256 ; i++) p[256+i] = p[i] = permutation[i]; 

function noise(x, y, z) {
    var x1 = Math.floor(Math.floor(x) & 255)
        y1 = Math.floor(Math.floor(y) & 255)
        z1 = Math.floor(Math.floor(z) & 255)

    x -= Math.floor(x)
    y -= Math.floor(y)
    z -= Math.floor(z)

    var x2 = fade(x)
        y2 = fade(y)
        z2 = fade(z)

    var A = p[x1  ]+y1, AA = p[A]+z1, AB = p[A+1]+z1,      // HASH COORDINATES OF
        B = p[x1+1]+y1, BA = p[B]+z1, BB = p[B+1]+z1;      // THE 8 CUBE CORNERS,

    return lerp(z2, lerp(y2, lerp(x2,gradient(p[AA], x  , y  , z   ), 
                                        gradient(p[BA], x-1, y  , z   )),
                            lerp(x2, gradient(p[AB], x  , y-1, z   ), 
                                        gradient(p[BB], x-1, y-1, z   ))),
                    lerp(y2, lerp(x2, gradient(p[AA+1], x  , y  , z-1 ), 
                                        gradient(p[BA+1], x-1, y  , z-1 )),
                            lerp(x2, gradient(p[AB+1], x  , y-1, z-1 ),
                                        gradient(p[BB+1], x-1, y-1, z-1 ))));
}
function fade(t) { 
    return t * t * t * (t * (t * 6 - 15) + 10); 
}

function lerp(t, a, b) { 
    return a + t * (b - a); 
}

function gradient(hash, x, y, z) {
    h = hash & 15;
    u = h<8 ? x : y;
    v = h<4 ? y : h==12 || h==14 ? x : z;

    return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
}

var a = 2

function noiseLayer(x, y, lacunarity, persistance, octaves, seed) {

    var freq = .5
    var ampl = 1.1
    var n = 1

    for (var o = 0; o < octaves; o++) {
        n += noise(x*freq, y*freq, seed) * ampl
        freq *= lacunarity
        ampl *= persistance
    }

    return n
}

function noiseLayerAbs(x, y, lacunarity, persistance, octaves, seed) {

    var freq = 0.5*a
    var ampl = 2/a
    var n = 1

    for (var o = 0; o < octaves; o++) {
        n += (Math.abs(noise(x*freq, y*freq, seed*ampl)) * -1 + 1) * ampl
        freq *= lacunarity
        ampl *= persistance
    }

    return n
}


















Cross = function(c, d) {

    return [
        c[2] * d[3] - c[3] * d[2],
        c[3] * d[1] - c[1] * d[3],
        c[1] * d[2] - c[2] * d[1]
    ]
}


CreateTerrain = function(seed) {

    var index = 0
    var indicesIndex = 0

    _vertices = []
    _indices = []

    var tx = 40

    for (var i = 0; i < tx; i++) {
        for (var j = 0; j < tx; j++) {
            _vertices[index*6] = ((i/tx)*2 - 1.0) * 20
            _vertices[index*6+1] = noiseLayerAbs(i/tx * 2.4, j/tx * 2.4, 2, 0.5, 3, seed) * 10 - 25
            _vertices[index*6+2] = ((j/tx)*2 - 1.0) * 20

            if (i != tx-1 && j != tx-1) {
                _indices[indicesIndex  ] = index+tx+1
                _indices[indicesIndex+1] = index+tx
                _indices[indicesIndex+2] = index
                _indices[indicesIndex+3] = index
                _indices[indicesIndex+4] = index+1
                _indices[indicesIndex+5] = index+tx+1
                indicesIndex += 6
            }
            index++
        }
    }

    for (var i = 0; i < _vertices.length / 6; i++) {
        var coord1 = [_vertices[i*6] == undefined ? 0 : _vertices[i*6], _vertices[i*6] == undefined ? 0 : _vertices[i*6],  _vertices[i*6] == undefined ? 0 : _vertices[i*6]]
        var coord2 = [_vertices[i*6] == undefined ? 0 : _vertices[i*6], _vertices[i*6] == undefined ? 0 : _vertices[i*6],  _vertices[i*6] == undefined ? 0 : _vertices[i*6]]
        var coord3 = [_vertices[i*6] == undefined ? 0 : _vertices[i*6], _vertices[i*6] == undefined ? 0 : _vertices[i*6],  _vertices[i*6] == undefined ? 0 : _vertices[i*6]]
        
        var a = [
            coord2[0] - coord1[0],
            coord2[1] - coord1[1],
            coord2[2] - coord1[2],
        ]
        var b = [
            coord3[0] - coord1[0],
            coord3[1] - coord1[1],
            coord3[2] - coord1[2],
        ]
        var dir = Cross(coord1, coord2)
        var length = 1.0 / Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2])
        var normal = [dir[0] * length, dir[1] * length, dir[2] * length]

        console.log(dir[0])

        _vertices[index*6+3] = normal[0]
        _vertices[index*6+4] = normal[1]
        _vertices[index*6+5] = normal[2]
    }

    return {
        vertices: _vertices,
        indices:  _indices
    }
}











CreateShader = function(vertexShaderSource, fragmentShaderSource, GL) {

    let vertex = GL.createShader(GL.VERTEX_SHADER)
    let fragment = GL.createShader(GL.FRAGMENT_SHADER)

    let program = GL.createProgram()

    GL.shaderSource(vertex, vertexShaderSource)
    GL.shaderSource(fragment, fragmentShaderSource)
    GL.compileShader(vertex)
    GL.compileShader(fragment)

    GL.attachShader(program, vertex)
    GL.attachShader(program, fragment)
    GL.linkProgram(program)

    return program
}

CreateRenderBuffer = function(GL) {

    let vertexbuffer = GL.createBuffer()
    let indexBuffer = GL.createBuffer()

    return {
        "VertexBufferObject": vertexbuffer,
        "IndexBufferObject": indexBuffer
    }
}

FindAttributeLocation = function(shader, name, GL) {
    return GL.getAttribLocation(shader.program, name)
}

UniformVector3Location = function(shader, name, val, GL) {
    let location = GL.getUniformLocation(shader.program, name)
    GL.uniform3fv(location, new Float32Array(val))
}

UniformMatrix4Location = function(shader, name, mat4x4, GL) {

    let location = GL.getUniformLocation(shader.program, name)
    GL.uniformMatrix4fv(location, GL.FALSE, mat4x4)
}








let mainShader = {
    program: CreateShader(mainVertex, mainFragment, mainCanvasGL),
    buffers: CreateRenderBuffer(mainCanvasGL)
}

let triangle = {
    vertices: [
         0.0,  0.5, 0.0,
        -0.5, -0.5, 0.0,
         0.5, -0.5, 0.0
    ]
}
let terrain = CreateTerrain(Math.random() * 1000000)

let width = window.innerWidth
let height = window.innerHeight
var time = 0

mainCanvas.width = 3000
mainCanvas.height = 3000

let perspectiveProjection = new Float32Array(16)
let lookAt = new Float32Array(16)
glMatrix.mat4.perspective(perspectiveProjection, glMatrix.glMatrix.toRadian(90), (width/height), 0.1, 2000.0);
glMatrix.mat4.lookAt(lookAt, [1, 1, 1], [0, 0, 0], [0, 1, 0])

WebGLInit = function() {

    let vertexAttributeLocation = FindAttributeLocation(mainShader, "vertex", mainCanvasGL)
    let normalAttributeLocation = FindAttributeLocation(mainShader, "normal", mainCanvasGL)
    mainCanvasGL.bindBuffer(mainCanvasGL.ARRAY_BUFFER, mainShader.buffers["VertexBufferObject"])
    mainCanvasGL.bufferData(mainCanvasGL.ARRAY_BUFFER, new Float32Array(terrain.vertices), mainCanvasGL.STATIC_DRAW)
    mainCanvasGL.bindBuffer(mainCanvasGL.ELEMENT_ARRAY_BUFFER, mainShader.buffers["IndexBufferObject"])
    mainCanvasGL.bufferData(mainCanvasGL.ELEMENT_ARRAY_BUFFER, new Uint16Array(terrain.indices), mainCanvasGL.STATIC_DRAW)

    mainCanvasGL.enableVertexAttribArray(vertexAttributeLocation)
    mainCanvasGL.vertexAttribPointer(vertexAttributeLocation, 
                                     3, 
                                     mainCanvasGL.FLOAT, 
                                     mainCanvasGL.FALSE, 
                                     6 * Float32Array.BYTES_PER_ELEMENT, 0)

    mainCanvasGL.vertexAttribPointer(normalAttributeLocation, 
                                     3, 
                                     mainCanvasGL.FLOAT, 
                                     mainCanvasGL.FALSE, 
                                     6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT)

    mainCanvasGL.enable(mainCanvasGL.DEPTH_TEST)
}

WebGLInit()

var cameraPosition = [10, 20, 10]
var lastxlocation = 0
var lastylocation = 0
var isMouseDown = false
var initialSeed = Math.random() * 1000000

WebGLLoop = function() {

    var seed = initialSeed + document.getElementById('background').scrollTop / 3000.0
    //let terrain = CreateTerrain(seed)

    window.onmousedown = function(e) {
        isMouseDown = true
    }
    window.onmouseup = function(e) {
        isMouseDown = false
    }

    window.onscroll = function(e) {
        var t = e.x
        console.log(t)
        seed = initialSeed + document.body.scrollTop
    }

    window.onmousemove = function(e) {
        var xlocation =  (e.offsetY / mainCanvas.clientWidth - 0.5) * 2
        var ylocation = -(e.offsetX / mainCanvas.clientHeight - 0.5) * 2

        var deltax = xlocation - lastxlocation
        var deltay = ylocation - lastylocation

        //if (isMouseDown) cameraPosition = [cameraPosition[0] - (deltax - deltay) * 10.8, 20, cameraPosition[2] - (deltay + deltax) * 10.8]

        lastxlocation = xlocation
        lastylocation = ylocation
    }

    mainCanvasGL.bindBuffer(mainCanvasGL.ARRAY_BUFFER, mainShader.buffers["VertexBufferObject"])
    mainCanvasGL.bufferData(mainCanvasGL.ARRAY_BUFFER, new Float32Array(terrain.vertices), mainCanvasGL.STATIC_DRAW)

    mainCanvasGL.clear(mainCanvasGL.COLOR_BUFFER_BIT | mainCanvasGL.DEPTH_BUFFER_BIT)
    mainCanvasGL.clearColor(0, 0, 0, 1.0)
    let width = window.outerWidth
    let height = window.outerHeight
    mainCanvasGL.viewport(0, 0, 3000, 3000)

    cameraPosition = [20 * Math.cos(time), 9, 20 * Math.sin(time)]

    glMatrix.mat4.ortho(perspectiveProjection, -width/70, width/70, -height/70, height/70, 0.01, 2000.0);
    //glMatrix.mat4.perspective(perspectiveProjection, glMatrix.glMatrix.toRadian(90), (width/height), 0.1, 2000.0);
    glMatrix.mat4.lookAt(lookAt, cameraPosition, [0, 0, 0], [0, 1, 0])

    mainCanvasGL.useProgram(mainShader.program)
    UniformMatrix4Location(mainShader, "projection", perspectiveProjection, mainCanvasGL)
    UniformMatrix4Location(mainShader, "lookAt", lookAt, mainCanvasGL)

    UniformVector3Location(mainShader, "col", [255, 255, 255], mainCanvasGL)
    //mainCanvasGL.drawElements(mainCanvasGL.TRIANGLES, terrain.indices.length, mainCanvasGL.UNSIGNED_SHORT, 0)

    UniformVector3Location(mainShader, "col", [255 - 94, 255 - 91, 255 - 93], mainCanvasGL);
    mainCanvasGL.drawElements(mainCanvasGL.LINES, terrain.indices.length, mainCanvasGL.UNSIGNED_SHORT, 0)
    mainCanvasGL.drawElements(mainCanvasGL.POINTS, terrain.indices.length, mainCanvasGL.UNSIGNED_SHORT, 0)

    time += 0.00125

    requestAnimationFrame(WebGLLoop)

    
}

requestAnimationFrame(WebGLLoop)