# JS face detection

- Uses tracking.js face detection to track the position of a face displayed on a webcam

## Built-with

- Jquery
- Bootstrap
- Tracking.js

## Installing and running

npm:
- npm i
- npm run server

# Notes

Npm run server uses [http-server](https://www.npmjs.com/package/http-server) to create a localhost server if needed  
I decided to go ahead and use jquery as it was bundled with the snippet  
I couldnt see any error handling bundled with track.js and it takes care of getUserMedia call  
The tracking doesnt seem to work very well on dimensions bigger than 320x240 at least on my laptop/webcam - perhaps need to adjust edge jitter more  
