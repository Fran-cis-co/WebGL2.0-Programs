var canvas;
var gl;

// default x and y values for the viewport
var xDefault = 100;
var yDefault = 100;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    var vertices = [
        vec2( -0.5, -0.5), vec4(1.0, 0.0, 2.0, 1.0),
        vec2(  -1,  1), vec4(0.0, 1.0, 0.0, 1.0),
        vec2(  1, 1), vec4(0.0, 560, 0.0, 1.0),
        vec2( 0.5, -0.5), vec4(1.0, 1.0, 1.0, 1.0),
    ];


    gl.viewport( xDefault, yDefault, canvas.width - 300, canvas.height - 300);
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program );

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(aPosition);

    var aColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);

    render();

    document.addEventListener("keydown", function(e){
        switch(e.key) {
            case "a":
                xDefault -= 10;
                if (xDefault < 10) {
                    xDefault = 10;
                }
                break
            case "w":
                yDefault += 10;
                if (yDefault > 300) {
                    yDefault = 300;
                }
                break
            case "s":
                yDefault -= 10;
                if (yDefault < -50) {
                    yDefault = -50
                }
                break
            case "d":
                xDefault += 10;
                if (xDefault > 300) {
                    xDefault = 300
                }
                break
            case "1":
                xDefault = 100;
                yDefault = 100;
                gl.viewport(xDefault, yDefault, canvas.width - 300, canvas.height - 300);
                render();
                break
        }
        gl.viewport(xDefault, yDefault, canvas.width - 300, canvas.height - 300);
        render();
    })
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4);
}
