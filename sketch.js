// Varible declaration

var deltaSize, deltaHealth, deltaLeafCount, deltaLeafSize, transitionTime, currentTree, startFrameCount;
var tf = new Transformer(); // Transformer gets the absolute position even when we use translate or rotate (these functions make coordinates relative)
var tf_w, tf_h; // Position of the tree tf_w -> x coordinate; tf_h -> y coordinate

var nameInp = 0;
var nameInputGen = false;
var drop = null;
var but = null;
var email = null;
var join = null;
var downloadImg = null;
var shareUrl = null;
var shareSheet = null;
var regenPage;
var treeData;
var blobUrl;


var shouldReturnInfo = false;

var input_string = "";
var item = '';
var t, but;
var e = new Energy();
var imageDownloadURL = "";
var imageDownloadName = "";

var stateID = {
    "NSW": "5f2fbdd345e403dc3124eeab",
    "QLD": "5f2fbc9204346b3e9e844ddd",
    "SA": "5f2f7beee7a01ac0ea2067f9",
    "TAS": "5f2fbd750f694b233faff8e7",
    "VIC": "5f2fbc8b0f694b7f75aff8e4",
    "WA": "5f2f7bff04346ba11f844894",
}

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


function setup() {                                                  // Setup function
    canv = createCanvas(innerWidth, innerHeight);               // Generate canvas
    if (innerWidth > innerHeight) {
        canv = createCanvas(innerWidth, innerHeight);               // Generate canvas
        tf_w = width / 1.5;                                         // Set value of tf_w and tf_h
        tf_h = height;
    } else {
        tf_w = width / 2;                                           // Set value of tf_w and tf_h
        tf_h = height;
    }
    frameRate(30);                                                  // Set frame rate
    but = select("#but");
    nameInp = select("#nameInp");
    drop = select("#stateSelect");
    email = select("#email");
    join = select("#regenToggle");
    downloadImg = select("#download-tree");
    shareUrl = select("#share-tree");
    shareSheet = select("#download-image-link");
    shareSheet.hide();

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
            if (shouldReturnInfo == true) {                             //Check if we should return the tree information. This is set to True after the tree gets created (pressing generate button). This makes the program wait until the tree is fully grown and then it generates the tree image.
                console.log("Joined the Renewable Generation")
                t.createTreeImage();                            //Generate image
                treeData = t.returnInfo();                  //Return tree information
                uploadImg(treeData);
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
    downloadImg.mouseClicked(forceDownload);
    shareUrl.mouseClicked(shareImg);

    
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
    
    shareSheet.hide()
    imageURL = "";
    imageName = "";

    translate(tf_w, tf_h);
    rotate(-PI);

    t = new tree(input_string, selectState, false, 8);           //generate the tree with the seed=input_string and the state

    t.quick_update(nullState, false);                           //Automatically set the state to the "null state" when the tree has no size
    t.lerp_update(selectState, 5);
    
    if (join.checked()) {
        shouldReturnInfo = true;
      } else {
        shouldReturnInfo = false;
      }                                                         // Update into the selected state

                                                                // Return the info after the tree grows                                       
}

function windowResized() {  //Function, that gets called when the window is resized
    canv = resizeCanvas(innerWidth, innerHeight);               //Resize the canvas

    if (innerWidth > innerHeight) {
        tf_w = width / 1.5;                                         // Set value of tf_w and tf_h
        tf_h = height;
    } else {
        tf_w = width / 2;                                         // Set value of tf_w and tf_h
        tf_h = height;
    }

    if (t) { t.generate(); }                                    // The tree gets regenerated

    setup();                                                    // Call the setup function again
}

async function uploadImg(imageInfo) {
    try {
        const formData = new FormData();
        var alt = imageInfo.slug;
        var caption = imageInfo.name + "'s tree generated on " + imageInfo.time_generated + " in " + imageInfo.state;
        formData.append("file", imageInfo.img);
        formData.append("upload_preset", "RegenUpload");
        formData.append("public_id", alt);
        formData.append("context", "caption=" + caption);
        formData.append("tags", imageInfo.state);
        const response = await fetch("https://api.cloudinary.com/v1_1/the-renewable-generation/image/upload", {
            method: "post",
            body: formData,
        });
        const json = await response.json();
        console.log("Regen Tree Uploaded");
        const imgUrl = json.secure_url;
        imageInfo.img = imgUrl.replace("https://res.cloudinary.com/the-renewable-generation/image/upload/","https://res.cloudinary.com/the-renewable-generation/image/upload/t_square/");
        imageInfo.state = stateID[imageInfo.state];
        publishTree(imageInfo);
        
      } catch (error) {
          console.error("Error:", error);
      }
}

async function publishTree(d) {
    try {
        var imgOverlay = d.img.replace("https://res.cloudinary.com/the-renewable-generation/image/upload/t_square/","https://res.cloudinary.com/the-renewable-generation/image/upload/t_regen-overlay/");
        var regenData = {};
        regenData = selectState;
        
        imageDownloadURL = imgOverlay;
        imageDownloadName = d.slug;
        downloadResource();

        const response = await fetch("https://v1.nocodeapi.com/JuiceBard/webflow/AzoDqMdhLHoExbfH?live=true", {
            method: "post",
	        body: JSON.stringify({
              "time-generated": d.time_generated,
              "name": d.name,
              "slug": imageDownloadName,
              "email": email.value(),
              "_archived": false,
              "_draft": false,
              "state-2": d.state,
              "img": imageDownloadURL,
              "image-of-the-tree": d.img,
              "regen-data": JSON.stringify(regenData)
            }),
            headers: {
                "Content-Type": "application/json",
            }
        });
        const json = await response.json();
        regenPage = "https://the-renewable-generation.webflow.io/the-forest/" + json.slug;
        console.log("Regen Tree Published");
        shareSheet.show();
    } catch (error) {
        console.error("Error:", error);
    }
}

function forceDownload() {
    var blob = blobUrl;
    var filename = imageDownloadName;
    var a = document.createElement('a');
    a.download = filename;
    a.href = blob;
    // For Firefox https://stackoverflow.com/a/32226068
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  
  // Current blob size limit is around 500MB for browsers
  function downloadResource() {
    var url = imageDownloadURL;
    var filename = imageDownloadName;
    fetch(url, {
        headers: new Headers({
          'Origin': location.origin
        }),
        mode: 'cors'
      })
      .then(response => response.blob())
      .then(blob => {
        blobUrl = window.URL.createObjectURL(blob);

      })
      .catch(e => console.error(e));
  }
function shareImg() {
    var dateGenerated = new Date(treeData.time_generated);
    var shareMessage = "Hey checkout my ReGen tree I generated at " + dateGenerated.getHours() + ":" + dateGenerated.getMinutes() + " on " + dateGenerated.getDate() + "/" + dateGenerated.getMonth() + "/" + dateGenerated.getFullYear();
    console.log(shareMessage);
    if (navigator.canShare) {
    navigator.share({
      url: regenPage,
      title: "Share my ReGen tree",
      text: shareMessage,
    })
    .then(() => console.log('Share was successful.'))
    .catch((error) => console.log('Sharing failed', error));
  } else {
    shareUrl
    console.log(`Your system doesn't support sharing files.`);
    console.log("Download requested");
    
  }
}
