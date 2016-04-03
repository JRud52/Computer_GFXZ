
//Render With the Following: povray randomPictures.pov +Q11 +A0.0 +R9 +J1.0 +OnameOfFile

global_settings{ assumed_gamma 1.0 }
#default{ finish{ ambient 0.1 diffuse 0.9 }}

#include "colors.inc"
#include "textures.inc"
#include "stones.inc"
#include "stones2.inc"
// camera ----------------------------------------------------
#declare Cam0 =camera {angle 48
                       location  <4.0 , 1.0 ,-6.0>
                       right x*image_width/image_height
                       look_at   <0.0 , 1.5 , 0.0>}
camera{Cam0}

//Random Number Generator Initializing
#declare initialSeed = seed(now*100000);
#declare randomNumber = rand(initialSeed);

//Color Array
#declare colorArray = array[10]
#declare colorArray[0] = color White;
#declare colorArray[1] = color HuntersGreen;
#declare colorArray[2] = color YellowGreen;
#declare colorArray[3] = color MandarinOrange;
#declare colorArray[4] = color OrangeRed;
#declare colorArray[5] = color Firebrick;
#declare colorArray[6] = color SlateBlue;
#declare colorArray[7] = color NeonBlue;
#declare colorArray[8] = color BlueViolet;
#declare colorArray[9] = color Black;

//Pigment Array
#declare pigmentArray = array[11]
#declare pigmentArray[0] =  pigment { mandel 50 exponent 2 //2...33
                                     // interior 1,2 exterior 1,2
                                     scale 0.50 translate<0.15,0,0>
                                     color_map{[0.00 color rgb <0.5,0,0.25>]
                                               [0.08 color rgb <0.8,0,0.10>]
                                               [0.20 color rgb <1,0.4,0.05>]
                                               [0.30 color rgb <1,0.7,0>]
                                               [0.60 color rgb <0.0,0,0>]
                                               [0.80 color rgb <0,0,0>]
                                               [1.00 color rgb <1,1,1>]}
                                     }
#declare pigmentArray[1] = pigment{  julia <0.360, 0.250>, 20
                                     interior 1, 1  scale 0.60
                                     color_map{[0.0 color rgb <0,0,0>]
                                               [0.2 color rgb <1,0,0>]
                                               [0.4 color rgb <1,1,0>]
                                               [1.0 color rgb <1,1,1>]
                                               [1.0 color rgb <0,0,0>]}
                                    }
#declare pigmentArray[2] = pigment{ magnet 1 // magnet type 1 or 2
                                     julia <0.360, 0.250>, 20  interior 1, 1
                                     scale 0.26 rotate<0,40,0>
                                     color_map{[0.0 color rgb <1,0.5,0>]
                                               [0.1 color rgb <1,0,0.5>]
                                               [0.4 color rgb <1,1,0>]
                                               [1.0 color rgb <1,1,1>]
                                               [1.0 color rgb <0,0,0>]}
                                    }
#declare pigmentArray[3] = pigment{ agate scale 1  rotate <0,0,0>
                                     color_map{ [0.0 color rgb <1,1,1>]
                                                [0.5 color rgb <0,0,0>]
                                                [1.0 color rgb <1,1,1>]
                                              }// end of color_map
                                    }
#declare pigmentArray[4] = pigment{ bozo scale 0.25 turbulence 0
                                     color_map{ [0.0 color rgb <1,1,0.2>]
                                                [0.5 color rgb <1,0.5,0>]
                                                [1.0 color rgb <1,0,0.5>]
                                              }// end of color_map
                                    }
#declare pigmentArray[5] = pigment{  crackle scale 1.5 turbulence 0.35
                                     color_map { [0.00 color rgb<0,0,0>]
                                                 [0.08 color rgb<0,0,0>]
                                                 [0.32 color rgb<1,0.65,0>]
                                                 [1.00 color rgb<1,1.0,0.5>]
                                               } // end of color_map
                                     scale 0.2
                                   }
#declare pigmentArray[6] =  pigment{  granite scale 1 turbulence 0
                                      color_map{ [0.0 color rgb <0,0,0>]
                                                   [0.5 color rgb <1,1,1>]
                                                   [1.0 color rgb <0,0,0>]
                                                 }// end of color_map // optional
                                           }
#declare pigmentArray[7] = pigment{ ripples phase 0.5 frequency 3
                                    color_map{ [0.0 color rgb <1,  1,1>]
                                               [0.0 color rgb <1,0.3,0>]
                                               [1.0 color rgb <0,  0,0>]
                                             }// end of color_map
                                    translate<0,3,0>}
#declare pigmentArray[8] = pigment{ wrinkles scale 0.20
                                     color_map{[0.0 color rgb <1,0,0.3>]
                                               [1.0 color rgb <1,1,1>]
                                              }//end of color_map
                                    }
#declare pigmentArray[9] = pigment{  hexagon
                                     color rgb<0.5,1,0>
                                     color rgb<1,0.7,0>
                                     color rgb<0,0.5,0>
                                     rotate<90,0,0> }
#declare pigmentArray[10] = pigment{ spiral2 10 //number of arms
                                     color_map{[0.0 color rgb <1,1,1>]
                                               [0.5 color rgb <1,1,1>]
                                               [0.5 color rgb <1,0,0>]
                                               [1.0 color rgb <1,0,0>]
                                              }//end of color_map
                                    }

//Normal Array
#declare normalArray = array[8]
#declare normalArray[0] = normal { agate 1.00 scale 0.5 }
#declare normalArray[1] = normal { agate 1.0  agate_turb 2.0 scale 0.5 }
#declare normalArray[2] = normal {  pigment_pattern{ crackle color_map{  [0.0, rgb 0.0]
                                                                        [0.3, rgb 0.1]
                                                                        [0.8, rgb 0.9]
                                                                        [1.0, rgb 1.0]}
                                     scale 0.3} // end pigment_pattern
                                     0.75 }
#declare normalArray[3] = normal { waves 0.75 scale 0.05 }
#declare normalArray[4] = normal { boxed 0.5 phase 0.11 frequency 18 }
#declare normalArray[5] = normal { planar 0.5 phase 0.05 frequency 12 }
#declare normalArray[6] = normal { spiral1 10 bump_size 2.00 }
#declare normalArray[7] = normal { spiral2 10 bump_size 0.75 sine_wave }


//Objects Here
// sun -------------------------------------------------------
light_source{<-1500,2500,1000> color rgb <0.5,0.5,0.5>}

light_source {  <-2.5,3,-2> color rgb <0.5,0.5,0.25>
                parallel
                point_at<0, 0, 0>
}
// sky -------------------------------------------------------
sphere{<0,0,0>,1 hollow
       texture{pigment{gradient <0,1,0>
                       color_map{[0 colorArray[int(9*rand(randomNumber))]]
                                 [1 colorArray[int(9*rand(randomNumber))]]}
                       quick_color White }
               finish     {ambient 1 diffuse 0} }
      scale 10000}
// ground ----------------------------------------------------
plane{ <0,1,0>, 0
       texture{ pigment { color colorArray[int(9*rand(randomNumber))] }
                normal  { normalArray[int(8*rand(randomNumber))]}
                finish { phong 1.0
                         specular 0.1
                         reflection 0.15
                         brilliance 0.5
                     irid { 0.25 thickness 0.5 turbulence 0.5 } }
              }
     }

#declare loopStart = 0;
#declare loopEnd = 45*rand(randomNumber)+5;

//Shapes - Spheres, Boxes, Sors, Ovus, Superellipsoids,
#while (loopStart < loopEnd)
    #declare switchOn = int(5*rand(randomNumber));
    #switch(switchOn)
        #case(0) //Sphere
            sphere{ <0,0,0>, 1.0
                    scale<0.5*rand(randomNumber),0.5*rand(randomNumber),0.5*rand(randomNumber)>
                    translate<-5+8*rand(randomNumber),-0.5+4*rand(randomNumber),-3+13*rand(randomNumber)>
                    texture{ pigment { pigmentArray[int(11*rand(randomNumber))]}
                             normal  { normalArray[int(8*rand(randomNumber))]}
                             finish { phong 1
                                      specular rand(randomNumber)
                                      reflection 0.25*rand(randomNumber)
                                      brilliance 4*rand(randomNumber)
                                      irid { 0.25*rand(randomNumber) thickness 0.5*rand(randomNumber) turbulence 0.5*rand(randomNumber) } }
                           }
                       }
            #debug "Made a Sphere\n"
        #break
        #case(1) //Boxes
            box{ <1*rand(randomNumber),1*rand(randomNumber),1*rand(randomNumber)>,<1*rand(randomNumber),1*rand(randomNumber),1*rand(randomNumber)>
                scale<0.5*rand(randomNumber),0.5*rand(randomNumber),0.5*rand(randomNumber)>
                translate<-5+8*rand(randomNumber),-0.5+4*rand(randomNumber),-3+13*rand(randomNumber)>
                texture{ pigment { pigmentArray[int(11*rand(randomNumber))]}
                         normal  { normalArray[int(8*rand(randomNumber))]}
                         finish { phong 1
                                  specular rand(randomNumber)
                                  reflection 0.25*rand(randomNumber)
                                  brilliance 4*rand(randomNumber)
                                  irid { 0.25*rand(randomNumber) thickness 0.5*rand(randomNumber) turbulence 0.5*rand(randomNumber) } }
                       }
                   }

            #debug "Made a Box\n"
        #break
        #case(2) //Sors
            sor{ 8, // n = 8 points!
                         < 0.00, 0.00>,
                         < 0.60, 0.00>,
                         < 0.72, 0.44>,
                         < 0.31, 0.93>,
                         < 0.49, 1.26>,
                         < 0.48, 1.35>,
                         < 0.43, 1.56>,
                         < 0.16, 1.60>
                         open
                         scale 0.5*rand(randomNumber)
                         translate<-5+8*rand(randomNumber),-0.5+4*rand(randomNumber),-3+13*rand(randomNumber)>
                         texture{ pigment { pigmentArray[int(11*rand(randomNumber))]}
                                  normal  { normalArray[int(8*rand(randomNumber))]}
                                  finish { phong 1
                                           specular rand(randomNumber)
                                           reflection 0.25*rand(randomNumber)
                                           brilliance 4*rand(randomNumber)
                                           irid { 0.25*rand(randomNumber) thickness 0.5*rand(randomNumber) turbulence 0.5*rand(randomNumber) } }
                                }
            }
            #debug "Made a Sor\n"
        #break
        #case(3) //Ovus
            ovus{ 0.75*rand(randomNumber)+0.25, 0.65
                texture{ pigment { pigmentArray[int(11*rand(randomNumber))]}
                         normal  { normalArray[int(8*rand(randomNumber))]}
                         finish { phong 1
                                  specular rand(randomNumber)
                                  reflection 0.25*rand(randomNumber)
                                  brilliance 4*rand(randomNumber)
                                  irid { 0.25*rand(randomNumber) thickness 0.5*rand(randomNumber) turbulence 0.5*rand(randomNumber) } }
                       }
                       scale 0.5*rand(randomNumber)
                       translate<-5+8*rand(randomNumber),-0.5+4*rand(randomNumber),-3+13*rand(randomNumber)>
                   }
            #debug "Made an Ovus\n"
        #break
        #case(4) //Superellipsoids
            superellipsoid{ <3.25*rand(randomNumber)+0.25,3.25*rand(randomNumber)+0.25>

                texture{ pigment { pigmentArray[int(11*rand(randomNumber))]}
                         normal  { normalArray[int(8*rand(randomNumber))]}
                         finish { phong 1
                                  specular rand(randomNumber)
                                  reflection rand(randomNumber)+0.15
                                  brilliance 4*rand(randomNumber)
                                  irid { 0.25*rand(randomNumber) thickness 0.5*rand(randomNumber) turbulence 0.5*rand(randomNumber) } }
                       }
                scale<0.5*rand(randomNumber),0.5*rand(randomNumber),0.5*rand(randomNumber)>
                 translate<-5+8*rand(randomNumber),-0.5+4*rand(randomNumber),-3+13*rand(randomNumber)>
            }
            #debug "Made a Superellipsoid\n"
        #break
        #else
            #debug "AHHHHHHHH?????!!"
    #end

    #declare loopStart = loopStart + 1; //Increment
#end
