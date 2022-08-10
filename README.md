# Whisker Setter
An electron app that helps you fit an image of sample whisker between two bezier curves.

## Installation and Boot
This project is built on electron and node js, therefore it needs to be setup at first using ```npm install```      
After installing all the necessary packages, you can start the app by ```npm start```      
*Release of binary executable is underway.*

## Usage
1. To set a curve, you must click 4 times on the prefered area for initiate 4 points of bezier curve
2. You would see 4 adjustable point on the screen, move them around to manipulate the curve. A dotted curve is visible on screen as a guide.
3. Futhermore, press enter key to finalize the curve and register it on the canvas.
4. Set another curve with the same process. Remember that whisker can only be set in pairs! You must have even number of curves.
5. You can select the type of whisker from whisker box situated above the canvas.

**Preview whisker set**    

6. To set whiskers on top of an image, simply click on ```Open``` button.
You can choose to include background image while saving or hide it by pressing ```Hide Background``` button.

**Preview background image set**     

7. To prevent your whisker from changing, lock your whisker with ```Save whisker``` button.

**Preview of whisker lock**

8. Save the canvas as jpg with ```Export``` button.

## Dependencies
- Node JS
- Electron
- P5js
- Bootstrap
