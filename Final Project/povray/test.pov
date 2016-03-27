//EXAMPLE OF SPHERE

//Files with predefined colors and textures
#include "colors.inc"
#include "glass.inc"
#include "golds.inc"
#include "metals.inc"
#include "stones.inc"
#include "woods.inc"

//Place the camera
camera {
  sky <0,0,1>           //Don't change this
  direction <-1,0,0>    //Don't change this
  right <-4/3,0,0>      //Don't change this
  location <35,0,0>   //Camera location
  look_at <0,0,0>     //Where camera is pointing
  angle 15      //Angle of the view--increase to see more, decrease to see less
}

//Ambient light to "brighten up" darker pictures
global_settings { ambient_light White }

//Place a light--you can have more than one!
light_source {
  <10,-10,20>   //Change this if you want to put the light at a different point
  color White*2         //Multiplying by 2 doubles the brightness
}

//Set a background color
background { color White }

#declare putTextureHere = texture {

        pigment{ magnet 2

                julia <0.360, 0.250>, 20 interior 1, 1
                scale 1
                rotate<0,40,0>
                color_map{[0.0 color rgb <1,0.5,0>]
                          [0.1 color rgb <1,0,0.5>]
                          [0.4 color rgb <1,1,0>]
                          [1.0 color rgb <1,1,1>]
                          [1.0 color rgb <0,0,0>]}
        }
}

//Create a box that extends between the 2 specified points
#declare mycube = box {
  <0,-4.40,-3.25>  // one corner position <X1 Y1 Z1>
  <0,4.40,3.25>  // other corner position <X2 Y2 Z2>

  texture { putTextureHere }
}

//Change cubes and their locations below this point.
// object { mycube translate <-5,-5,-5> texture {T_Stone32} }
object { mycube }
