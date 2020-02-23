class Molecule {
    constructor(name, geometry, material, chamber_edge_length) {
        this.name = name;


        // geometry.computeFaceNormals();
        // geometry.computeBoundingSphere();
        geometry.center();



        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(
            d3.randomUniform(-1)(1),
            d3.randomUniform(-1)(1),
            d3.randomUniform(-1)(1));


        //console.log(this.mesh.position)

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

    tick(data) {

        this.check_neighbors(data);
        //cHECK to see if we are inside a wall?

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

    check_walls(chamber_edge_length) {

        if ((this.mesh.position.x >= chamber_edge_length / 2) ||
            (this.mesh.position.x <= -chamber_edge_length / 2)) {

            this.mesh.position.setX(Math.sign(this.velocity.x) * chamber_edge_length / 2);

            this.velocity.setX(this.velocity.x * -1);
        }

        if ((this.mesh.position.y >= chamber_edge_length / 2) ||
            (this.mesh.position.y <= -chamber_edge_length / 2)) {

            this.mesh.position.setY(Math.sign(this.velocity.y) * chamber_edge_length / 2);

            this.velocity.setY(this.velocity.y * -1);
        }

        if ((this.mesh.position.z >= chamber_edge_length / 2) ||
            (this.mesh.position.z <= -chamber_edge_length / 2)) {

            this.mesh.position.setZ(Math.sign(this.velocity.z) * chamber_edge_length / 2);

            this.velocity.setZ(this.velocity.z * -1);
        }
    }

    merge(mol_1) {
        console.log('we hit!')

    }
    check_neighbors(data) {
        //console.log('check neighbors')

        let possible_x = [];
        let possible_x_y = [];

        for (let x = 0; x < data.instances.length; x++) {
            //console.log(data.instances[x])

            let aprox =
                this.mesh.position.x -
                data.instances[x].mesh.position.x;

            //console.log(aprox);

            if (Math.abs(aprox < 1)) {
                //console.log('we hit! X')
                possible_x.push(data.instances[x])
            }
        }

        for (let y = 0; y < possible_x.length; y++) {

            let aprox =
                this.mesh.position.y -
                possible_x[y].mesh.position.y;

            //console.log(aprox);

            if (Math.abs(aprox < 1)) {
                //console.log('we hit Y!')
                possible_x_y.push(possible_x[y])
            }
        }
        //console.log(possible_x_y);
        for (let z = 0; z < possible_x_y.length; z++) {

            let aprox =
                this.mesh.position.z -
                possible_x_y[z].mesh.position.z;

            //console.log(aprox);

            if (Math.abs(aprox < 1)) {

                this.merge(possible_x_y[z]);
            }
        }

    }

    update(data, delta_t, chamber_edge_length) {


        this.mesh.position.addScaledVector(this.velocity, delta_t);
        this.mesh.rotateOnAxis(this.rotational_axis, .05);



        this.check_walls(chamber_edge_length);






        //return console.log()
    }
}

export default Molecule;