class Molecule {
    constructor(name, geometry, material) {
        this.name = name;

        // geometry.computeFaceNormals();
        // geometry.computeBoundingSphere();
        geometry.center();



        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(
            d3.randomNormal(0.0)(.33),
            d3.randomNormal(0.0)(.33),
            d3.randomNormal(0.0)(.33));

        // this.mesh.updateMatrixWorld();
        // this.mesh.updateMatrix();
        // create a geometry
        //geometry = new THREE.BoxBufferGeometry(2, 2, 2);
        //material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

        // create a Mesh containing the geometry and material
        // this.mesh = new THREE.Mesh(geometry, material);



        // velocity is normally around 5×10^11 nm/s (nanometers per second)
        // My timesteps are on the order of 10^-11 seconds
        // 5 nm each tick
        // this is wayyyy to fast.  with more I wonder how fast my animation ticks are. 
        // on my laptop: about the order of 10^-2
        // so this could put us into the:
        // .05 nm each tick

        this.velocity = new THREE.Vector3(
            d3.randomNormal(0.0)(1),
            d3.randomNormal(0.0)(1),
            d3.randomNormal(0.0)(1));

        this.rotational_axis = new THREE.Vector3(
                d3.randomNormal(0.0)(1),
                d3.randomNormal(0.0)(1),
                d3.randomNormal(0.0)(1))
            .normalize();


    }

    tick() {

        //randomly move about
        // this.mesh.position.set(
        //     d3.randomNormal(0.0)(.33),
        //     d3.randomNormal(0.0)(.33),
        //     d3.randomNormal(0.0)(.33));


        //set the position to one corner of the cube
        // then clamp all at chamber length
        // run reverse/bounce/passthrough on any object with one of these values
        // .clampScalar ( min : Float, max : Float ) : this
        // min - the minimum value the components will be clamped to
        // max - the maximum value the components will be clamped to

        // If this vector's x, y or z values are greater than the max value, they are replaced by the max value.



    }


    update(delta_t) {
        // console.log('update');
        // console.log(this.velocity);
        // // add velocity
        // //console.log('delta_t: ' + delta_t);

        // this.adjusted_velocity = new THREE.Vector3(this.velocity.x, this.velocity.y, this.velocity.z);
        // this.adjusted_velocity.multiplyScalar(delta_t)

        // console.log(this.adjusted_velocity);





        // 
        // 
        // 

        //

        // Movement
        // if (this.molecule.x) {

        // }

        //this.mesh.position.add(this.velocity);
        // // Rotation

        this.mesh.position.addScaledVector(this.velocity, delta_t);
        this.mesh.rotateOnAxis(this.rotational_axis, .05);

        //return console.log()
    }


}

export default Molecule;