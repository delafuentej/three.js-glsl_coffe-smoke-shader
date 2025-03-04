uniform float uTime;
uniform sampler2D uPerlinTexture;


varying vec2 vUv;

void main(){

    // to create a new variable: scale and animate. We can transform it
    vec2 smokeUv = vUv;
    smokeUv.x *= 0.5;
    smokeUv.y *= 0.3;
    smokeUv.y -= uTime * 0.03;
    
   //Since perlin texture is a gray scale image, we can use the red channel only
   //Switch the variable smoke from vec4 to a float, and .r (only the r channel)
    //Smoke
    float smoke= texture(uPerlinTexture, smokeUv).r;
    // we have to remap "smoke":
    smoke = smoothstep(0.4, 1.0, smoke);

    //fade the edges:
    //smoke = 1.0;
    smoke *= smoothstep(0.0, 0.1, vUv.x);
    smoke *= smoothstep(1.0, 0.9, vUv.x);
    smoke *= smoothstep(0.0, 0.1, vUv.y);
    smoke *= smoothstep(1.0, 0.4, vUv.y);

    //Final Color
    //gl_FragColor = vec4(smoke, smoke, smoke, 1.0);
    // we are goint to set the color to white, and try the smoke  on the alpha value:(to fix it: transparent: true) 
    gl_FragColor = vec4(0.6, 0.3, 0.2, smoke);

    // setting the gl_FragColor to red
   // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}