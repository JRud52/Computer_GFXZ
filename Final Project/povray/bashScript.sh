#!/bin/bash
COUNTER=0
while [  $COUNTER -lt 20 ]; do
    povray randomPictures.pov +Q11 +A0.0 +R9 +J1.0 +Opic$COUNTER
    let COUNTER=COUNTER+1
done
