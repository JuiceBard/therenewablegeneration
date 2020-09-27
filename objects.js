var treeWidth = 4;
var lineWidth = 2;

function defaultThicknessFunction(depth) { //Global function - linear depth to thickness mapping function - default
    // The default relation
    return depth;
}
function erf(x) { // Error function aproximation (sigmoid function with the needed domain)
    var m = 1.00;
    var s = 1.00;
    var sum = x * 1.0;
    for (var i = 1; i < 25; i++) {
        m *= i;
        s *= -1;
        sum += (s * Math.pow(x, 2.0 * i + 1.0)) / (m * (2.0 * i + 1.0));
    }
    return 2 * sum / Math.sqrt(3.14159265358979);
}

class branch { // A branch object (a straight line)
    constructor(in_x1, in_y1, in_x2, in_y2, depth) {
        this.x1 = in_x1; // Coordinate 2D verctor #1
        this.y1 = in_y1;
        this.x2 = in_x2; // Coordinate 2D vector #2
        this.y2 = in_y2;

        this.depth = depth; // How deep into the recursion the branch is
    }

    drawLine(sway, mD) { // drawLine function (mD = maximum depth)
        noFill();

        var a_x1 = this.x1 + (mD - this.depth - 1) * 5 * Math.sin(sway); //Calculates all the coordinates but adds the swaying
        var a_y1 = this.y1 + (mD - this.depth - 1) * 2 * abs(pow(cos(sway), 2));
        var a_x2 = this.x2 + (mD - this.depth) * 5 * Math.sin(sway);
        var a_y2 = this.y2 + (mD - this.depth) * 2 * abs(pow(cos(sway), 2));

        line(a_x1, a_y1, a_x2, a_y2); //Draw a straight line
    }

    drawBez(sway, px, py, health, mD) { // Draws a curve
        var a_x1 = this.x1 + (mD - this.depth - 1) * 5 * Math.sin(sway); //Calculates all the coordinates but adds the swaying
        var a_y1 = this.y1 + (mD - this.depth - 1) * 2 * abs(pow(cos(sway), 2));
        var a_x2 = this.x2 + (mD - this.depth) * 5 * Math.sin(sway);
        var a_y2 = this.y2 + (mD - this.depth) * 2 * abs(pow(cos(sway), 2));

        push();
        noFill();
        curveTightness(health / 100 - 0.75); // Sets the tightness depending on the tree health

        beginShape(); //Start drawing
        curveVertex(a_x2, a_y2); //Add all the vertices
        curveVertex(a_x2, a_y2);

        curveVertex(a_x1, a_y1);

        curveVertex(px, py); // px and py are additinal coordinates of the parent branch joint
        endShape(); //Stop drawing

        pop();
    }
}

class branchJoint { // A branch joint object - stores branches and jonts
    constructor(_branches = [], _joints = [], depth) {
        this._branches = _branches; // All of the branches
        this._joints = _joints; // All of the ongoing _branches
        this.x = null; // position is added manually later and thus it is not a parameter of the constructor
        this.y = null;
        this.depth = depth; //Depth of the joint
    }

    drawLine(thicknessFunction, treeSize, sway, h, mD) {
        for (var i = 0; i < this._branches.length; i++) { //drawLine _branches of this joint
            if (this._branches[i]) { //check that the branch isn't null
                strokeWeight(thicknessFunction(this.depth - 1) * treeSize / 100) //set the strokeWeight (depends on the thickness function)
                this._branches[i].drawBez(sway, //Draw the branch
                     this.x + (mD - this.depth - 1) * 5 * Math.sin(sway), //Add the sway of x
                      this.y + (mD - this.depth - 1) * 2 * abs(pow(cos(sway), 2)) //Add the sway of y
                      , h, mD);
            }
        }
        for (var i = 0; i < this._joints.length; i++) { // Recursively drawLine out all _joints
            if (this._joints[i]) { //Check that joint isnt null
                this._joints[i].drawLine(thicknessFunction, treeSize, sway, h, mD);
            }
        }
    }
}

class tree { // A tree object - stores the trunk (trunks and all the _joints)
    constructor(seed, state, draw_ = false, maxDepth = 8) { // Set all the basic values
        this.name = seed;
        this.state = state;
        this.time = state.timeGenerated;

        this._branches = null;
        this._joints = null;
        this.depth = maxDepth;
        this.sway = 0;

        this.all_joints = [];
        this.rngGen = null;
        this.transition = { startFrame: 0, endFrame: 0, startState: this.state, endState: this.state };

        this.size = state.treeSize + 50;
        this.health = state.treeHealth + 50;
        this.total_demand = state.totalDemand;
        this.leaves = [];
        this.total_supply = 0;
        for (var i = 0; i < state.supply.length; i++) { // Calculate the total supply
            this.total_supply += state.supply[i].megawatts;
        }

        this.generate(); // generate the tree

        if (draw_) {
            this.draw(); // Draw the tree (not by default)
        }
    }

    display() {
        var interState = {} //Create a new state object (intermediate state)
        interState.supply = this.transition.endState.supply; //Copy the supplies
        interState.timeGenerated = this.transition.endState.timeGenerated; // Copy the generation time
        interState.state = this.transition.endState.state; //Copy the state

        var dSize = (frameCount - this.transition.startFrame) * (this.transition.endState.treeSize - this.transition.startState.treeSize) / (this.transition.endFrame - this.transition.startFrame) //Calculate the delta size
        interState.treeSize = this.transition.startState.treeSize + dSize; //lerps linearly between the two amounts
        var dHealth = (frameCount - this.transition.startFrame) * (this.transition.endState.treeHealth - this.transition.startState.treeHealth) / (this.transition.endFrame - this.transition.startFrame) //Calculate the delta health
        interState.treeHealth = this.transition.startState.treeHealth + dHealth; //lerps linearly between the two amounts
        var dTotalDemand = (frameCount - this.transition.startFrame) * (this.transition.endState.totalDemand - this.transition.startState.totalDemand) / (this.transition.endFrame - this.transition.startFrame) //Calculate the delta total demand
        interState.totalDemand = this.transition.startState.totalDemand + dTotalDemand; //lerps linearly between the two amounts

        if (frameCount > this.transition.startFrame && frameCount < this.transition.endFrame) { //Check if the transition is still active
            this.quick_update(interState) //quick updates to the new state
        }

        this.draw(); //draws the tree

        var des = []; //Description information variable
        var idk = []; //Placeholder description information variable
        var desID = -1; // Index of the leaf that is chosen
        for (var i = 0; i < this.leaves.length; i++) { //Go through all the leaves
            idk = this.leaves[i].getDesc(this.total_supply, this.size, this.sway, this.depth); //Generate their descriptions

            if (idk.length > 2) { //Check if placeholder contains new data
                des = idk;
                desID = i;
            }
            else if (des[0] > idk[0]) { //Check if the new leave is closer to the mouse
                des = idk;
                desID = i;
            }
        }
        var lineToCenter;
        for (var i = 0; i < this.leaves.length; i++) { // loop through the leaves
            if (des.length > 2) { // check if there is any tree that has the color priority
                if (desID == i) { // Draw the leaf with the priority id with double the opacity
                    lineToCenter = this.leaves[i].drawLeaf(this.total_supply, this.size, this.sway, this.depth, 2);
                }
                else { // Draw all the other leave with 1/2 the opacity
                    this.leaves[i].drawLeaf(this.total_supply, this.size, this.sway, this.depth);
                }
            } // Else: draw all of the equaly
            else {
              this.leaves[i].drawLeaf(this.total_supply, this.size, this.sway, this.depth);
            }
        }

        if (des.length > 2) { // Check if any description should be shown

            strokeWeight(1);
            stroke(0);
            noFill();
        
            rotate(-PI);
            
            push();
            // draw rectangle behind source and supply text
            fill(255,255,255);
            rect(des[3][1]-20,des[3][2]-30,200,65);


            noStroke();
            textSize(15); //Prepare
            fill(0, 0, 0,255);

            text(des[2][0], des[3][1], des[3][2]); //Write the text
            text(des[3][0], des[2][1], des[2][2]);

            pop();

        }

        this.sway += 0.03; // Increse the sway clock
    }

    drawLine(col = [0, 0, 0], thicknessFunction = defaultThicknessFunction, sway = this.sway) { //Very similar to branchJoint.drawline()
        stroke(col);
        fill(col);

        for (var i = 0; i < this._branches.length; i++) { //draw branches
            if (this._branches[i]) {
                strokeWeight(thicknessFunction(this.depth) * this.size / 100)
                this._branches[i].drawBez(sway, 0, 0, this.health, this.depth);
            }
        }
        for (var i = 0; i < this._joints.length; i++) { // Start the recusion
            if (this._joints[i]) {
                this._joints[i].drawLine(thicknessFunction, this.size, sway, this.health, this.depth);
            }
        }
    }

    draw() {
        push(); // Draws thw tree twice in different colors
        this.drawLine([0, 0, 0], function (x) { return treeWidth * Math.pow(2, x / 1.3) * height / 8000 + lineWidth }, this.sway)
        this.drawLine([255, 255, 255], function (x) { return treeWidth * Math.pow(2, x / 1.3) * height / 8000 }, this.sway)
        pop();
    }

    createTreeImage() {
        var canvases = document.getElementsByTagName("canvas"); // get the canvas object
        var url = canvases[canvases.length - 1].toDataURL("image/png", 1); // create the url
        this.img = url; // set the url
        return url; // return the url
    }

    returnInfo() {
        this.createTreeImage(); // update the image
        var slugAppend = this.name + " " + this.state.state + " " + this.state.timeGenerated;
        var slugAppend = slugAppend.replace(/[ ;:'+".,@#$%^&!()*|]/g,'-');
        var returnVal = { // create a nice object (information package)
            "img": this.img,
            "name": this.name,
            "slug": slugAppend,
            "state": this.state.state,
            "time_generated": this.state.timeGenerated
        };
        return returnVal; // return the package
    }

    quick_update(newState, gen = true) { // Sets the now information and regenerates the tree (by default)
        this.state = newState; // replace the state

        this.size = newState.treeSize + 50; // update size
        this.health = newState.treeHealth + 50; // update health

        if (gen) { this.generate(); } // Regenerate the tree (default)
    }

    lerp_update(newState, transTime) { //Set all the transition information into the tree.transition object
        this.transition.startFrame = frameCount; // start is this frame
        this.transition.endFrame = frameCount + transTime * frameRate(); // end is calculated by the duration

        this.transition.startState = this.state; // Set the states
        this.transition.endState = newState;
    }

    generate(seed = this.name) { // Goes through all the generation phases
        this.rngGen = new Math.seedrandom(seed); // Resets the pseudo-random seedable generator

        this.total_supply = 0; // resets total supply
        for (var i = 0; i < this.state.supply.length; i++) { //Goes through all the supplies
            this.total_supply += this.state.supply[i].megawatts; // Calculates total supply
        }

        this._joints = null; // Resets this trees joints and branches
        this._branches = null;
        this.generateBranch(this.depth, 2, this.depth, this.size, this.health, 2); // Generates new branches and joints

        this.all_joints = []; // Resets the all_joints array
        this.generateAll_joints(this, this._joints) // generates the all_joints array

        this.leaves = []; // resets leaves
        this.generateLeaves(); // generates leaves
    }

    generateAll_joints(tree, joint) { // Recursively goes through all the joints and pushes all of them into a singluar array thus destroying the connection between them (efficint for creating leaves)
        for (var i = 0; i < joint.length; i++) { // Goes through all the joints connected joints
            if (joint[i]) { // checks for nulls
                tree.generateAll_joints(tree, joint[i]._joints) // Recursion is called here
                tree.all_joints.push(joint[i]) // The joint is pushed into the all_joints array
            }
        }
    }

    generateLeaves() { // generates leaves
        var leaf_count = this.state.supply.length; // Gets the amount of leaves from the amount of supplies
        var prohib = []; // prohibited indexes

        for (var i = 0; i < leaf_count; i++) { // Loop to generate the desired amount
            var jointIndex = Math.floor(map(this.rngGen(), 0, 1, 0, this.all_joints.length - 2, true)) // Generate a new pseudo-random index
            var r = 0; // escape variable - if this exceedes some value, the loop breaks - for performance

            for (var j = 0; j < prohib.length; j++) { // Goes through all the prohibite indexes
                if (jointIndex == prohib[j]) { // Checks if the index is prohibited
                    jointIndex = Math.floor(map(this.rngGen(), 0, 1, 0, this.all_joints.length - 2, true)) // Regenerates the index

                    j = 0; // Resets the loop
                    r++; // Adds to the reset count
                }
                else { // Index is ok
                    if (this.all_joints[jointIndex].depth > Math.floor(this.depth / 1.5)) { // Check that the joint's depth at that index is not too small
                        prohib.push(jointIndex); // prohibits this index
                        jointIndex = Math.floor(map(this.rngGen(), 0, 1, 0, this.all_joints.length - 2, true)) // regenerates the index

                        j = 0; // Resets the loop
                        r++; // Adds to the reset count
                    }
                }

                if (r > 500) { break; } // Break the loop of there were too many resets
            }

            prohib.push(jointIndex); // prohibits the selected index

            var sup = this.state.supply[i]; // gets the supply
            this.leaves.push(new leaf(sup.source, sup.megawatts, sup.renewable, this.all_joints[jointIndex].x, this.all_joints[jointIndex].y, this.all_joints[jointIndex].depth)); // Creates a new leaf object
        }
    }
    generateBranch(branchDepth = this.depth, numOf_branches = 2, maxDepth = this.depth, size = this.size, health = this.health, id = 0, effiAngleDivisor = 1, func = function (x) { return 2 * Math.pow(2, x / 1.3) * height / 8000 }) {
        tf.push();

        var angle; // Declare angle variable

        if (branchDepth == 0) { //Exit the recursion when the recursion level is 0
            return ([null, null, null]);
        }
        //Generate branch
        tf.push();

        var length = map(this.rngGen(), 0, 1, 0.5, 1.5, true) * sqrt(branchDepth) * height * size / (10 * 100 * sqrt(maxDepth)); //Generate pseudo-random length

        var idk = (health / 20) - 1.0; // original values (health / 12.5) - 1.5
        angle = map(erf(this.rngGen()), 0, 1, -PI / (effiAngleDivisor * idk), PI / (effiAngleDivisor * idk)); //Generate the angle (effiAngleDivisor is changed to 2 when we have the maximum branchDepth thus making the trunk more shallow)

        //angle += PI / 12 * (1 - health / 100) * sin(tf.a + angle) * Math.sqrt(maxDepth); //Bending - could be adde but is fairly comuputationaly difficult

        var retJoint = new branchJoint(); // Create a return joint
        retJoint.depth = branchDepth; // set it's depth

        var sidestep = Math.sign(id%2 - 0.5) * func(branchDepth)/2 * size/100; // Calculate the offset. This makes the branhces line up better

        tf.rotate(angle); //Rotate by the angle
        tf.translate(0, length); //Move the origin of the coordiante system to be at the end of the branch

        //line(0, 0, -sidestep, -length) // This is the old way of drawing the tree

        for (var i = 0; i < numOf_branches; i++) { //Loop through this as many times as is the amount of branches needed to be generated
            var branchInfo = this.generateBranch(branchDepth - 1, 2, maxDepth, size, health, i); //generate the branches (recursion) and save the information (branchJoint, branch) of the generated branch

            retJoint._joints.push(branchInfo[0]); //Add the other _joints
            retJoint._branches.push(branchInfo[1]); //Add the branch

            tf.pop();
        }

        var tfx = tf.x; // get the absolute position at this moment
        var tfy = tf.y;

        tf.translate(sidestep, -length); //Move the origin back to the joint
        tf.rotate(-angle); // undo the rotation


        var retBranch = new branch(tf.x, tf.y, tfx, tfy, branchDepth) //Generate the return branch
        retJoint.x = tf.x; // Set the joint's position
        retJoint.y = tf.y;

        this._branches = [retBranch]; // Make arrays
        this._joints = [retJoint];

        tf.pop();

        return [retJoint, retBranch]; //Return the joint and the branch
    }
}

class leaf {
    constructor(source, supply, renewable, x, y, depth) {
        this.x = x; //Position
        this.y = y;
        this.source = source; // the type
        this.supply = supply; // amount - MW
        this.renewable = renewable; //Set the renewability

        this.depth = depth; // depth
    }

    drawLeaf(total_supply, tree_size, sway, mD, mult = 1) {


        push();
        var x = this.x + (mD - this.depth) * 5 * Math.sin(sway);
        var y = this.y + (mD - this.depth) * 2 * abs(pow(cos(sway), 2));

        var c = color(0, 255, 0);
        c.setAlpha(100 * mult);


        var size = tree_size / 100 * Math.cbrt(this.supply / total_supply) * height / 4

        fill(c);
        noStroke();

        ellipse(x, y, size);
        pop();
        if (mult == 2){
          return [x,y];
        }

    }

    getDesc(total_supply, tree_size, sway, mD) {
        var x = this.x + (mD - this.depth) * 5 * Math.sin(sway); // Calculates the position with the sway
        var y = this.y + (mD - this.depth) * 2 * abs(pow(cos(sway), 2));

        var size = tree_size / 100 * Math.cbrt(this.supply / total_supply) * height / 4 // Calculates the diameter of the circle

        var dis = dist(x, y, tf_w - mouseX, tf_h - mouseY)
        var description = [dis, size]; // Creates the description array (contains the distance from the mouse and the size of the leaf)

        if (dis < size / 2) { // check if the mouse is close enough
            description.push(["Source: " + this.source, -this.x + size / 2, -this.y + 15 - size / 2]) // Add the first line (contains the text, x, y)
            description.push(["Supply: " + this.supply + " MW", -this.x + size / 2, -this.y - size / 2]) // Add the second line (contains the text, x, y)
            return (description); // return the description
        }

        return [] // Otherwise return empty
    }
}
