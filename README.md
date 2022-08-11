# Whisker Setter
An electron app that helps you fit an image of sample whisker between two bezier curves.

## Industry need for whisker setter
Denim manufacturing companies, during the laser printing process, have to make designs of whiskers in black & white color palette beforehand. Designs are usually made in apps such as photoshop, illustrator, or arcon. These app usually involves a lot of manual effort because user has to first insert appropriate whisker image and then use perspective wrap tools to fit the whisker into certain areas. However, by using this app, you can directly determine the area using bezier curves (modifiable laterwards) and choose the whisker image as per your liking! Not only that, you would also see a live preview of your final design on the canvas. Furthermore, you can set backgrounds, lock whiskers, undo, and export just by a click. Our main objective is to make the design process a little less hectic.

## Pre-requisite
This project is built on electron and node js, therefore it needs to be setup at first using ```npm install```      
After installing all the necessary packages, you can start the app by ```npm start```      
*Release of a binary executable is underway.*

## Usage
1. To set a curve, you must click 4 times on the prefered area for initiate 4 points of bezier curve
2. You would see 4 adjustable point on the screen, move them around to manipulate the curve. A dotted curve is visible on screen as a guide.
3. Futhermore, press enter key to finalize the curve and register it on the canvas.
4. Set another curve with the same process. Remember that whisker can only be set in pairs! You must have even number of curves.
5. You can select the type of whisker from whisker box situated above the canvas.

![Set stroke](/previews/set_stroke.gif)    

6. To set whiskers on top of an image, simply click on ```Open``` button.
You can choose to include background image while saving or hide it by pressing ```Hide Background``` button.

![Set background](/previews/set_background.gif)     

7. To prevent your whisker from changing, lock your whisker with ```Save whisker``` button.

![Save whisker](/previews/save_whisker.gif)

8. Save the canvas as jpg with ```Export``` button.

## Dependencies
- Node JS
- Electron
- P5js
- Bootstrap
