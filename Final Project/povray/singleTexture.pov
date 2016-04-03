
//Render With the Following: povray test.pov +Q11 +A0.1 +R9

//Includes
#include "colors.inc"
#include "glass.inc"
#include "golds.inc"
#include "metals.inc"
#include "stones.inc"
#include "woods.inc"
#include "textures.inc"

//Camera Settings
camera {
        sky <0,0,1>         //Don't change this
        direction <-1,0,0>  //Don't change this
        right <-4/3,0,0>    //Don't change this
        location <35,0,0>   //Camera location
        look_at <0,0,0>     //Direction of Camera
        angle 15            //FOV of Camera
}

//Ambient Light
global_settings {
        ambient_light White
}

//Directional Light
light_source {
        <10,-10,20>         //Position of Light
        color White*2       //Double the Brightness
}

//Set a background color
background {
        color White         //Background Color
}

#declare putTextureHere = texture {

        pigment { Blood_Sky }
}

//Create a box that extends between the 2 specified points
#declare mycube = box {

        <0,-4.40,-3.25>    // one corner position <X1 Y1 Z1>
        <0,4.40,3.25>      // other corner position <X2 Y2 Z2>

        texture { putTextureHere }
}

//Change cubes and their locations below this point.
//Object { mycube translate <-5,-5,-5> texture {T_Stone32} }
object { mycube }
