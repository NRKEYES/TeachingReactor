// let conc_reactants = starting_amount / (1 + k_fwd * starting_amount * t * t_step);
// let conc_products = stoich_coef * (starting_amount - conc_reactants);
// let percent_product = (conc_products / (conc_products + conc_reactants));
// for (name in species) {
//     species[name].percent.push(1 - percent_product);
//     species[name].count.push(A);
// }


function update_slider_value(passed) {
    passed.parentElement.lastElementChild.innerHTML = passed.value;
    //console.log(this.parentElement.lastElementChild.innerHTML)
}




function make_line() {
    // adding a line
    this.points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, 100, 0));
    points.push(new THREE.Vector3(10, 0, 0));

    geometry = new THREE.BufferGeometry().setFromPoints(points);
    material = new THREE.LineBasicMaterial({ color: 0x0000ff });

    line = new THREE.Line(geometry, material);

    scene.add(line);
}




//gridHelper.setRotationFromQuaternion(quat);

createBoxShape(sx, sy, sz) {
    var shape = new Ammo.btBoxShape(new Ammo.btVector3(sx, sy, sz));
    shape.setMargin(this.margin);
    return shape;
}





// // ADD GRIDS
// var size = this.chamber_edge_length;
// var divisions = this.chamber_edge_length;

// var gridHelper = new THREE.GridHelper(size, divisions, 'black', 'black');



// pos.set(-this.chamber_edge_length / 2, 0, 0);
// quat.set(0, 0, 0, 1);

// let geometry = new THREE.BoxBufferGeometry(.2, this.chamber_edge_length, this.chamber_edge_length);
// this.chamber = new THREE.Mesh(geometry, material);
// this.chamber.position.set(pos.x, pos.y, pos.z);
// this.scene.add(this.chamber);

// this.createRigidBody(
//     geometry,
//     this.createBoxShape(1, this.chamber_edge_length, this.chamber_edge_length),
//     1,
//     pos,
//     quat);

// gridHelper.setRotationFromQuaternion(quat);
// gridHelper.position.copy(pos);
// this.scene.add(gridHelper);


// gridHelper = new THREE.GridHelper(size, divisions, 'black', 'black');
// gridHelper.position.set(0, 0, -this.chamber_edge_length / 2);
// gridHelper.geometry.rotateX(Math.PI / 2);
// this.scene.add(gridHelper);
// pos.set(0, 0, -this.chamber_edge_length / 2);
// quat.set(0, 0, 0, 1);
// this.createRigidBody(new THREE.Object3D(), this.createBoxShape(this.chamber_edge_length, this.chamber_edge_length, this.chamber_edge_length), 0, pos, quat);


// gridHelper = new THREE.GridHelper(size, divisions, 'black', 'black');
// gridHelper.position.set(-this.chamber_edge_length / 2, 0, 0);
// gridHelper.geometry.rotateZ(Math.PI / 2);
// this.scene.add(gridHelper);
// pos.set(-this.chamber_edge_length / 2, 0, 0);
// quat.set(0, 0, 0, 1);
// this.createRigidBody(new THREE.Object3D(), this.createBoxShape(this.chamber_edge_length, this.chamber_edge_length, this.chamber_edge_length), 0, pos, quat);



// gridHelper = new THREE.GridHelper(size, divisions);
// gridHelper.position.set(0, this.chamber_edge_length / 2, 0);
// this.scene.add(gridHelper);
// pos.set(0, this.chamber_edge_length / 2, 0);
// quat.set(0, 0, 0, 1);
// this.createRigidBody(new THREE.Object3D(), this.createBoxShape(this.chamber_edge_length, this.chamber_edge_length, this.chamber_edge_length), 0, pos, quat);



// gridHelper = new THREE.GridHelper(size, divisions);
// gridHelper.position.set(0, 0, this.chamber_edge_length / 2);
// gridHelper.geometry.rotateX(Math.PI / 2);
// this.scene.add(gridHelper);
// pos.set(0, this.chamber_edge_length / 2, 0);
// quat.set(0, 0, 0, 1);
// this.createRigidBody(new THREE.Object3D(), this.createBoxShape(this.chamber_edge_length, this.chamber_edge_length, this.chamber_edge_length), 0, pos, quat);


// gridHelper = new THREE.GridHelper(size, divisions);
// gridHelper.position.set(this.chamber_edge_length / 2, 0, 0);
// gridHelper.geometry.rotateZ(Math.PI / 2);
// this.scene.add(gridHelper);
// pos.set(0, this.chamber_edge_length / 2, 0);
// quat.set(0, 0, 0, 1);
// this.createRigidBody(new THREE.Object3D(), this.createBoxShape(this.chamber_edge_length, this.chamber_edge_length, this.chamber_edge_length), 0, pos, quat);




//Set of transparent walls towards the initial camera
// material = new THREE.MeshPhysicalMaterial({
//     color: 'lightblue',
//     metalness: 1.0,
//     roughness: .1,
//     //alphaMap: texture2,
//     //alphaTest: 0.33,
//     envMap: texture1,
//     envMapIntensity: .9,
//     depthTest: true,
//     transparency: .8,
//     transparent: true,
//     side: THREE.DoubleSide,
// });
// geometry = new THREE.BoxBufferGeometry(.2, this.chamber_edge_length, this.chamber_edge_length);
// this.chamber = new THREE.Mesh(geometry, material);

// this.chamber.position.set(this.chamber_edge_length / 2, 0, 0);
// //console.log(this.chamber)
// this.scene.add(this.chamber);

// geometry = new THREE.BoxBufferGeometry(this.chamber_edge_length, .2, this.chamber_edge_length);
// this.chamber = new THREE.Mesh(geometry, material);

// this.chamber.position.set(0, this.chamber_edge_length / 2, 0);
// //console.log(this.chamber)
// this.scene.add(this.chamber);

// geometry = new THREE.BoxBufferGeometry(this.chamber_edge_length, this.chamber_edge_length, .2);
// this.chamber = new THREE.Mesh(geometry, material);

// this.chamber.position.set(0, 0, this.chamber_edge_length / 2);
// //console.log(this.chamber)
// this.scene.add(this.chamber);



// geometry.dispose();
// material.dispose();
//selectedObjects.push(chamber)


// let mass = 0;


// let pos = new THREE.Vector3();
// let quat = new THREE.Quaternion();



// let material = new THREE.MeshPhysicalMaterial({
//     color: 'yellow',
//     emissive: 'grey',
//     reflectivity: 0,
//     metalness: .9,
//     roughness: 1,
//     //envMap: envMap,
//     side: THREE.BackSide

// });


// let geometry = new THREE.SphereBufferGeometry(
//     this.chamber_edge_length * 10, 4, 4, 4);

// this.chamber = new THREE.Mesh(geometry, material);
// this.chamber.receiveShadow = false;
// this.chamber.castShadow = false;
// this.chamber.position.set(0, 0, 0);
// this.scene.add(this.chamber);




// let chamber_spacing = .3


// let material = new THREE.MeshPhysicalMaterial({
//     color: 'grey',
//     emissive: 'grey',
//     reflectivity: 0,
//     metalness: .9,
//     roughness: 1,
//     envMap: envMap,
//     polygonOffset: true,
//     polygonOffsetFactor: 1, // positive value pushes polygon further away
//     polygonOffsetUnits: 1,
//     side: THREE.DoubleSide

// });

// let geometry = new THREE.BoxBufferGeometry(.2, this.chamber_edge_length, this.chamber_edge_length);
// this.chamber = new THREE.Mesh(geometry, material);
// this.chamber.receiveShadow = true;
// this.chamber.position.set(-this.chamber_edge_length / 2 - chamber_spacing, 0, 0);
// this.scene.add(this.chamber);

// // material = new THREE.MeshPhysicalMaterial({
// //     color: 'grey',
// //     emissive: 'grey',
// //     reflectivity: 0,
// //     roughness: 1,
// //     envMap: envMap,
// // });

// geometry = new THREE.BoxBufferGeometry(this.chamber_edge_length, .2, this.chamber_edge_length);
// this.chamber = new THREE.Mesh(geometry, material);
// this.chamber.receiveShadow = true;
// this.chamber.position.set(0, -this.chamber_edge_length / 2 - chamber_spacing, 0);
// this.scene.add(this.chamber);

// geometry = new THREE.BoxGeometry(
//     this.chamber_edge_length, this.chamber_edge_length, .2, // size
//     this.chamber_edge_length, this.chamber_edge_length, 1); // divisions
// this.chamber = new THREE.Mesh(geometry, material);
// this.chamber.receiveShadow = true;
// this.chamber.position.set(0, 0, -this.chamber_edge_length / 2 - chamber_spacing);
// this.scene.add(this.chamber);



add_reaction_chamber() {
    // Reaction Chamber

    let texture1 = new THREE.TextureLoader().load('Images/steel.jpg');
    let texture2 = new THREE.TextureLoader().load('Images/glass1.gif');

    let material = new THREE.MeshPhysicalMaterial({
        color: 'lightblue',
        metalness: 1.0,
        roughness: .1,
        //alphaMap: texture2,
        //alphaTest: 0.33,
        envMap: texture1,
        envMapIntensity: .9,
        depthTest: true,
        transparency: .8,
        transparent: true,
        side: THREE.DoubleSide,
    });

    let geometry = new THREE.BoxBufferGeometry(this.chamber_edge_length, this.chamber_edge_length, this.chamber_edge_length);
    this.chamber = new THREE.Mesh(geometry, material);
    this.chamber.castShadow = true;
    this.chamber.receiveShadow = true;
    this.chamber.position.set(0, 0, 0);
    //console.log(this.chamber)
    this.scene.add(this.chamber);

    // geometry.dispose();
    // material.dispose();
    //selectedObjects.push(chamber)
}