// Varible declaration

var deltaSize, deltaHealth, deltaLeafCount, deltaLeafSize, transitionTime, currentTree, startFrameCount;
var tf = new Transformer(); // Transformer gets the absolute position even when we use translate or rotate (these functions make coordinates relative)
var tf_w, tf_h; // Position of the tree tf_w -> x coordinate; tf_h -> y coordinate

var nameInp = 0;
var nameInputGen = false;
var drop = null;
var but = null;

var shouldReturnInfo = false;

var input_string = "";
var item = '';
var t, but;
var e = new Energy();

// Tree states used for testing etc.
var defaultState = {

    "state": "NSW",
    "treeHealth": 75,
    "treeSize": 75,
    "totalDemand": 8962.85,
    "timeGenerated": "2020-08-17T22:45:00+10:00",
    "supply": [{
        "source": "Black Coal",
        "megawatts": 8000.56,
        "renewable": false
    },
    {
        "source": "Brown Coal",
        "megawatts": 4264.45,
        "renewable": false
    },
    {
        "source": "Gas",
        "megawatts": 190.43,
        "renewable": false
    },
    {
        "source": "Liquid Fuel",
        "megawatts": 0.23,
        "renewable": false
    },
    {
        "source": "Hydro",
        "megawatts": 31,
        "renewable": true
    },
    {
        "source": "Wind",
        "megawatts": 159.84,
        "renewable": true
    },
    {
        "source": "Small Solar",
        "megawatts": 168,
        "renewable": true
    },
    {
        "source": "Large Solar",
        "megawatts": 162,
        "renewable": true
    }
    ]
};
var nullState = {
    "state": "",
    "treeHealth": 0,
    "treeSize": -50,
    "totalDemand": 0,
    "timeGenerated": "0",
    "supply": []
};
var selectState = defaultState;

var State1_1 = {

    "state": "QLD",
    "treeHealth": 100,
    "treeSize": 100,
    "totalDemand": 6000.85,
    "timeGenerated": "2020-08-17T22:45:00+10:00",
    "supply": [
        {
            "source": "Gas",
            "megawatts": 190.43,
            "renewable": false
        },
        {
            "source": "Liquid Fuel",
            "megawatts": 0.23,
            "renewable": false
        },
        {
            "source": "Hydro",
            "megawatts": 31,
            "renewable": true
        },
        {
            "source": "Wind",
            "megawatts": 159.84,
            "renewable": true
        },
        {
            "source": "Small Solar",
            "megawatts": 168,
            "renewable": true
        },
        {
            "source": "Large Solar",
            "megawatts": 162,
            "renewable": true
        }
    ]
};
var State1_0 = {

    "state": "QLD",
    "treeHealth": 100,
    "treeSize": 0,
    "totalDemand": 6000.85,
    "timeGenerated": "2020-08-17T22:45:00+10:00",
    "supply": [
        {
            "source": "Gas",
            "megawatts": 190.43,
            "renewable": false
        },
        {
            "source": "Liquid Fuel",
            "megawatts": 0.23,
            "renewable": false
        },
        {
            "source": "Hydro",
            "megawatts": 31,
            "renewable": true
        },
        {
            "source": "Wind",
            "megawatts": 159.84,
            "renewable": true
        },
        {
            "source": "Small Solar",
            "megawatts": 168,
            "renewable": true
        },
        {
            "source": "Large Solar",
            "megawatts": 162,
            "renewable": true
        }
    ]
};
var State0_1 = {

    "state": "QLD",
    "treeHealth": 0,
    "treeSize": 100,
    "totalDemand": 6000.85,
    "timeGenerated": "2020-08-17T22:45:00+10:00",
    "supply": [
        {
            "source": "Gas",
            "megawatts": 190.43,
            "renewable": false
        },
        {
            "source": "Liquid Fuel",
            "megawatts": 0.23,
            "renewable": false
        },
        {
            "source": "Hydro",
            "megawatts": 31,
            "renewable": true
        },
        {
            "source": "Wind",
            "megawatts": 159.84,
            "renewable": true
        },
        {
            "source": "Small Solar",
            "megawatts": 168,
            "renewable": true
        },
        {
            "source": "Large Solar",
            "megawatts": 162,
            "renewable": true
        }
    ]
};
var State0_0 = {

    "state": "QLD",
    "treeHealth": 0,
    "treeSize": 0,
    "totalDemand": 6000.85,
    "timeGenerated": "2020-08-17T22:45:00+10:00",
    "supply": [
        {
            "source": "Gas",
            "megawatts": 190.43,
            "renewable": false
        },
        {
            "source": "Liquid Fuel",
            "megawatts": 0.23,
            "renewable": false
        },
        {
            "source": "Hydro",
            "megawatts": 31,
            "renewable": true
        },
        {
            "source": "Wind",
            "megawatts": 159.84,
            "renewable": true
        },
        {
            "source": "Small Solar",
            "megawatts": 168,
            "renewable": true
        },
        {
            "source": "Large Solar",
            "megawatts": 162,
            "renewable": true
        }
    ]
};

function setup() {// Setup function
    canv = createCanvas(innerWidth, innerHeight);               // Generate canvas
    frameRate(30);                                              // Set frame rate

    tf_w = width / 1.5;                                         // Set value of tf_w and tf_h
    tf_h = height;

    but = select("#but");
    nameInp = select("#nameInp");
    drop = select("#stateSelect");
}

function draw() { //Looping draw function (called each frame)
    push();

    clear();                                                    //Initial settings
    background(255);
    stroke(0);

    translate(tf_w, tf_h);                                      //Set the origin to be at tf_w, tf_h and to be pointing up (not accounted for Transformer)


    if (t != null) {
        rotate(-PI);                                            //Check if tree (stored in the t variable) is generated
        t.display();                                            //If so, call the display function

        if (frameCount > t.transition.endFrame) {               // Check if the tree is not in the middle of an animation
            if (shouldReturnInfo) {                             //Check if we should return the tree information. This is set to True after the tree gets created (pressing generate button). This makes the program wait until the tree is fully grown and then it generates the tree image.
                t.createTreeImage();                            //Generate image
                t.returnInfo();                                 //Return tree information
                shouldReturnInfo = false;                       //Change to false
            }
        }
    } else {
//       noStroke();
//       text("Enter details to generate your tree", 0 , -100);

    }
    but.mouseClicked(change_tree);
    nameInp.input(name_inp);
    drop.changed(state_select);
}

function name_inp() { //Function, that gets called when the name in the nameInp field changes
    input_string = this.value();                                //Set the global variable input_string to the written value
}

function state_select() { //Function, that gets called when the selected drop-down menu item gets changed
    item = this.value();                                        //Set the global variable item to the selected value

    e.update();                                                 //Update the global Energy object

    if (item == '') { selectState = defaultState }              //The tree's selected state is set to default state if there is no special selection
    else {
        selectState = e[item];                                  //Otherwise get the value from the Energy object of the same name as the selected item
    }

    t.lerp_update(selectState, 3);                              //The tree gets updated into the right state
}

function change_tree() { //Function, that gets called when the button is pressed
    clear();                                                    // Basic preparation
    background(255);
    stroke(0);

    translate(width / 1.5, height)
    rotate(-PI)

    t = new tree(input_string, selectState, false, 8)           //generate the tree with the seed=input_string and the state

    t.quick_update(nullState, false);                           //Automatically set the state to the "null state" when the tree has no size
    t.lerp_update(selectState, 5);                              // Update into the selected state

    shouldReturnInfo = true;                                    // Return the info after the tree grows
}

function windowResized() {  //Function, that gets called when the window is resized
    canv = resizeCanvas(innerWidth, innerHeight);               //Resize the canvas

    tf_w = width / 1.5;
    tf_h = height;

    if (t) { t.generate(); }                                    // The tree gets regenerated

    setup();                                                    // Call the setup function again
}

function mouseClicked() { //Function, that gets called when the mouse is pressed
                                          // Call the button's built in mousePressed function
}
