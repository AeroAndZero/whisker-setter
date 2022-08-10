import tkinter as tk
from tkinter import filedialog
from PIL import ImageTk,Image
import cv2
import os
import numpy as np
import ast
import shutil

#Setting up main window
root = tk.Tk()
root.title("Whisker Setter")
root.geometry("1280x720")

#Configuring column
root.columnconfigure(0,weight=1)
root.columnconfigure(1,weight=10)

root.rowconfigure(0,weight=1)

direction = []
def onLeftDrag(event):
    direction.insert(0,[event.x,event.y])
    dragVectorX = direction[1][0] - direction[0][0]
    dragVectorY = direction[1][1] - direction[0][1]
    event.widget.xview_scroll(dragVectorX,tk.UNITS)
    event.widget.yview_scroll(dragVectorY,tk.UNITS)
    direction.pop()
    
def MouseClick(event):
    try:
        direction.pop()
    except:
        pass
    finally:
        direction.insert(0,[event.x,event.y])
    event.widget.bind('<B1-Motion>', onLeftDrag)

def filename(fp):
    fn = fp.split('/')
    return fn[len(fn)-1]

def openfile():
    global resultFrame,gDetected
    #Reading The File
    ftype = [('JPEG','*.jpg'),('PNG','*.png')]
    dlg = filedialog.Open(filetypes = ftype)
    fp = dlg.show()     #Gives path of the open file
    if fp == '':
        return
    fn = filename(fp)   #Returns File Name
    
    #Creating temp Folder For opencv access
    try:
        os.mkdir(".temp")
    except OSError:
        print("Failed to make temp folder")

    #Copying Image to the temp folder
    destination = os.getcwd() + "/.temp/" + fn
    dest = shutil.copyfile(fp,destination)

    #Final File Path
    image_path = ".temp/"+str(fn)

    return fn

def displayImage(img,canvas,size=[]):   #Displays Image On A Specific Canvas
    canvas.original = img
    resize_img = cv2.resize(img,(size[0],size[1]))
    canvas.sizeX = size[0]
    canvas.sizeY = size[1]
    canvas_img = cvtImg(resize_img)
    canvas.canvas_img = canvas_img
    canvas.create_image(0,0,image=canvas_img,anchor="nw")
    canvas.config(scrollregion=(0,0,canvas.sizeX,canvas.sizeY))

    root.update()
    print("Displayed!")

def bindScrollbar(Canvas):
    ScrollbarY = tk.Scrollbar(Canvas,orient="vertical")    #Y-Scrollbar
    ScrollbarX = tk.Scrollbar(Canvas,orient="horizontal")   #X-Scrollbar
    Canvas.config(yscrollcommand=ScrollbarY.set,xscrollcommand=ScrollbarX.set,yscrollincrement='1',xscrollincrement='1')    #Config Canvas For Y & X
    ScrollbarY.config(command=Canvas.yview)         #Config Command For Scroll Y
    ScrollbarX.config(command=Canvas.xview)         #Config Command For Scroll X
    ScrollbarY.pack(side=tk.RIGHT,fill=tk.Y)          #Packing Scroll Y
    ScrollbarX.pack(side=tk.BOTTOM,fill=tk.X)         #Packing Scroll X

#Main function starts everything
def main():

	#-------------    Whisker Selection Panel
	whiskerImageList = []
	whiskerButtonList = []
	whiskerPanel = tk.LabelFrame(root,text="Select Whisker")
	whiskerPanel.grid(row=0,column=0,sticky="NEWS")
	whiskerPanel.columnconfigure(0,weight=1)
	whiskerPanel.columnconfigure(1,weight=1)
	wRow = 0
	wColumn = 0
	for wImages in range(1,21,1):
		#String Image name
		i = "00"	
		if wImages < 10:
			i = "0" + str(wImages)
		else:
			i = str(wImages)

		whiskerImage = ImageTk.PhotoImage(Image.open(i+".png").resize((100,27)))
		whiskerImageList.append(whiskerImage)

	for wImages in range(1,21,1):
		#Row and column checker
		if wColumn > 1 :
			wColumn = 0
			wRow += 1

		whiskerButton = tk.Button(whiskerPanel,text=str(wImages),image=whiskerImageList[wImages-1],compound="left")
		whiskerButton.grid(row=wRow,column=wColumn,sticky="NEWS",padx=2,pady=2)
		whiskerButtonList.append(whiskerButton)

		wColumn += 1

	#-------------   Whisker Drawing Panel
	drawingPanel = tk.LabelFrame(root,text="Draw Panel")
	drawingPanel.grid(row=0,column=1,sticky="NEWS")

	drawCanvas = tk.Canvas(drawingPanel, bg="white", width=1200,height=900,scrollregion=(0,0,1200,900))
	drawCanvas.pack(expand="yes",fill="both")
	bindScrollbar(drawCanvas)

	drawCanvas.bind("<Button-1>",MouseClick)
	openfile()


	root.mainloop()

if __name__ == '__main__':
	main()