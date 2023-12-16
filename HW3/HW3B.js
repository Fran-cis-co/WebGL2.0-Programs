"use strict";

var canvas;
var gl;

var positions = [];

var numTimesToSubdivide = 0;

window.onload = function init()
{
    // create starter triangle
    createTriangle();
};


function triangle(a, b, c)
{
    positions.push(a, b, c);
}

function divideTriangle(a, b, c, count)
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle(a, b, c);
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}


// function to render the starter triangle with no 'openness'
function createTriangle()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three positions.

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
        numTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    render();
}
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, positions.length );
}


function delayForSecond(time)
{
    return new Promise(resolve => setTimeout(resolve, time));
}

document.addEventListener("DOMContentLoaded", function(){
    // event listener for single click subdivision
    document.getElementById("gl-canvas").addEventListener("click", function (){
        numTimesToSubdivide++
        if(numTimesToSubdivide > 8)
        {
            numTimesToSubdivide = 0
        }
        positions = []
        createTriangle();
    })

    // event listener to iterate through subdivisions every second
    document.getElementById("gl-canvas").addEventListener("contextmenu", (event) => {
        var interval = setInterval(function(){
            numTimesToSubdivide++
            if(numTimesToSubdivide > 8){
                clearInterval(interval)
                numTimesToSubdivide = 0;
                positions = []
                createTriangle();
            }

            positions = []
            createTriangle()
        }, 1000)

        event.preventDefault()
    })
})