uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

#include ../includes/rotate2D.glsl

void main(){

     vec3 newPosition = position;

     //Twist Effect:
    
     //hear all vertices rotate the same way, we need that the rotation
     //is different according to the elevation:
    //   float angle = 2.0;
    //  newPosition.xz = rotate2D(newPosition.xz, angle);
    // it is to regular and not animated, we need to use uTime and uPerlinTexture => twistPerlin var
     float twistPerlin = texture(
        uPerlinTexture, 
        vec2(0.5, uv.y * 0.2 - uTime * 0.005)
        ).r;
    //float angle = newPosition.y;
    float angle = twistPerlin * 10.0;


    newPosition.xz = rotate2D(newPosition.xz, angle);



    
   
       // Wind Effect:
       vec2 windOffset = vec2(
        texture(uPerlinTexture, vec2(0.25, uTime * 0.01)).r - 0.5,
        texture(uPerlinTexture, vec2(0.75, uTime * 0.01)).r - 0.5
        );
        windOffset *= pow(uv.y, 3.0) * 10.0;
        newPosition.xz += windOffset;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    //Final Position
    gl_Position = projectedPosition;

    //Varyings
    vUv = uv;

}