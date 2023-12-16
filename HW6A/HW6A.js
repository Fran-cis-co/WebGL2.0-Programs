"use strict";

var HW6A = function() {

    var canvas;
    var gl;

    var numPositions = 36;
    var texSize = 64;

    var image1 = new Array()
        for (var i =0; i<texSize; i++)  image1[i] = new Array();
        for (var i =0; i<texSize; i++)
            for ( var j = 0; j < texSize; j++)
                image1[i][j] = new Float32Array(4);
        for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
            var c = (((i & 0x8) == 0) ^ ((j & 0x8) == 0));
            image1[i][j] = [c, c, c, 1];
        }

    var image2 = new Uint8Array(4*texSize*texSize);
        for (var i = 0; i < texSize; i++)
            for (var j = 0; j < texSize; j++)
                for(var k =0; k<4; k++)
                    image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];


    var positionsArray = [];
    var normalsArray = [];
    var texCoordsArray = [];


    var texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];
    var vertices = [
        vec4(-1.0, -0.5,  0.5, 1.0),
        vec4(-1.0,  0.5,  0.8, 1.0),
        vec4(1.0,  0.5,  1.0, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -1.0, 1.0),
        vec4(-1.0,  0.5, -0.5, 1.0),
        vec4(0.5,  0.5, -1.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
    var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
    var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
    var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

    var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
    var materialDiffuse = vec4(0.0, 2.0, 4.0, 2.0);
    var materialSpecular = vec4(1.0, 0.0, 0.0, 1.0);
    var materialShininess = 100.0;

    var ctm;
    var ambientColor, diffuseColor, specularColor;
    var modelViewMatrix, projectionMatrix;
    var viewerPos;
    var program;

    var xAxis = 0;
    var yAxis = 1;
    var zAxis = 2;
    var axis = 0;
    var theta = vec3(0, 0, 0);

    var thetaLoc;

    var flag = true;


    function configureTexture(image){
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
            gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
    function quad(a, b, c, d) {

        var t1 = subtract(vertices[b], vertices[a]);
        var t2 = subtract(vertices[c], vertices[b]);
        var normal = cross(t1, t2);
        normal = vec3(normal);


        positionsArray.push(vertices[a]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[0]);

        positionsArray.push(vertices[b]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[1]);

        positionsArray.push(vertices[c]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[2]);

        positionsArray.push(vertices[a]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[0]);

        positionsArray.push(vertices[c]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[2]);

        positionsArray.push(vertices[d]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[3]);
    }


    function colorCube()
    {
        quad(1, 0, 3, 2);
        quad(2, 3, 7, 6);
        quad(3, 0, 4, 7);
        quad(6, 5, 1, 2);
        quad(4, 5, 6, 7);
        quad(5, 4, 0, 1);
    }


    window.onload = function init() {
        canvas = document.getElementById("gl-canvas");

        gl = canvas.getContext('webgl2');
        if (!gl) alert( "WebGL 2.0 isn't available");


        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);

        gl.enable(gl.DEPTH_TEST);

        //
        //  Load shaders and initialize attribute buffers
        //
        program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        colorCube();

        var nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

        var normalLoc = gl.getAttribLocation(program, "aNormal");
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalLoc);

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        var tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
        var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(texCoordLoc);

        configureTexture(image2);

        gl.uniform1i( gl.getUniformLocation(program, "uTextureMap"), 0);
        thetaLoc = gl.getUniformLocation(program, "theta");

        viewerPos = vec3(0.0, 0.0, -100.0);

        projectionMatrix = ortho(-3, 3, -3, 3, -50, 50);

        var ambientProduct = mult(lightAmbient, materialAmbient);
        var diffuseProduct = mult(lightDiffuse, materialDiffuse);
        var specularProduct = mult(lightSpecular, materialSpecular);

        window.addEventListener("keydown", (event) => {
            // switch case statement to determine the arrow pressed
            switch(event.keyCode){
                case 37:
                    theta[yAxis] -= 2.0;
                    console.log("Left pressed");
                    break;
                case 38:
                    theta[xAxis] += 2.0;
                    console.log("up pressed");
                    break;
                case 39:
                    theta[yAxis] += 2.0;
                    console.log("right key pressed");
                    break;
                case 40:
                    theta[xAxis] -= 2.0;
                    console.log("down key pressed");
                    break;
            }
        });

        gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"),
            ambientProduct);
        gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"),
            diffuseProduct );
        gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"),
            specularProduct );
        gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"),
            lightPosition );

        gl.uniform1f(gl.getUniformLocation(program,
            "uShininess"), materialShininess);

        gl.uniformMatrix4fv( gl.getUniformLocation(program, "uProjectionMatrix"),
            false, flatten(projectionMatrix));
        render();
    }

    var render = function(){

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));

        //console.log(modelView);

        gl.uniformMatrix4fv(gl.getUniformLocation(program,
            "uModelViewMatrix"), false, flatten(modelViewMatrix));

        gl.drawArrays(gl.TRIANGLES, 0, numPositions);


        requestAnimationFrame(render);
    }

}

HW6A();
