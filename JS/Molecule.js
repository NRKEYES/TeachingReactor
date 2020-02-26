class Molecule {
    constructor(name, geometry, material, chamber_edge_length) {
        this.name = name;
        this.radius = .07;

        let pos = {
            x: d3.randomUniform(-2, 2)(),
            y: d3.randomUniform(-2, 2)(),
            z: d3.randomUniform(-2, 2)()
        };

        // let pos = {
        //     x: 0,
        //     y: 0,
        //     z: 0
        // };

        let vel = {
            x: d3.randomNormal(0.0)(1),
            y: d3.randomNormal(0.0)(1),
            z: d3.randomNormal(0.0)(1)
        };

        // this.rotational_axis = new THREE.Vector3(
        //         d3.randomNormal(0.0)(1),
        //         d3.randomNormal(0.0)(1),
        //         d3.randomNormal(0.0)(1))
        //     .normalize();

        let quat = {
            x: d3.randomNormal(0.0)(1),
            y: d3.randomNormal(0.0)(1),
            z: d3.randomNormal(0.0)(1),
            w: 1
        };
        // geometry.computeFaceNormals();
        geometry.computeBoundingSphere();
        geometry.center();



        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(pos.x, pos.y, pos.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.mass = 1;



        //Ammojs Section
        this.transform = new Ammo.btTransform();

        this.transform.setIdentity();

        this.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));

        this.transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

        this.motionState = new Ammo.btDefaultMotionState(this.transform);

        this.colShape = new Ammo.btSphereShape(this.radius);
        //this.colShape = geometry;
        this.colShape.setMargin(0.05);

        this.localInertia = new Ammo.btVector3(vel.x, vel.y, vel.z);
        this.colShape.calculateLocalInertia(this.mass, this.localInertia);

        this.rbInfo = new Ammo.btRigidBodyConstructionInfo(this.mass, this.motionState, this.colShape, this.localInertia);
        this.body = new Ammo.btRigidBody(this.rbInfo);
        this.body.setRestitution(1);
        this.body.setDamping(0.8, 0);
        this.mesh.userData.physicsBody = this.body;
    }

    tick(data) {

        // if (this.check) {
        //     this.check_neighbors(data);
        // } else {
        //     this.check = true;
        // }
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
        //console.log('we hit!');
        //console.log(mol_1.name.length)

        let mass_factor = this.name.length / mol_1.name.length;

        //console.log(mol_1.velocity);
        mol_1.velocity.addScaledVector(mol_1.velocity, -2 * mass_factor);
        //console.log(mol_1.velocity);

        mol_1.check = false;
        this.velocity.addScaledVector(this.velocity, -2 * (1 / mass_factor));



        //this.velocity = // multiply by factor based on mass

    }

    check_neighbors(data) {
        //console.log('check neighbors')

        let hit_dist = .2;


        let possible_x = [];
        let possible_x_y = [];




        for (let x = 0; x < data.instances.length; x++) {
            //console.log(data.instances[x])

            let aprox =
                this.mesh.position.x -
                data.instances[x].mesh.position.x;

            //console.log(aprox);

            if (Math.abs(aprox < hit_dist)) {
                //console.log('we hit! X')
                possible_x.push(data.instances[x])
            }
        }

        for (let y = 0; y < possible_x.length; y++) {

            let aprox =
                this.mesh.position.y -
                possible_x[y].mesh.position.y;

            //console.log(aprox);

            if (Math.abs(aprox < hit_dist)) {
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

            if (Math.abs(aprox < hit_dist)) {

                this.merge(possible_x_y[z]);
            }
        }

    }

    update(data, delta_t, chamber_edge_length) {

        // this.mesh.position.addScaledVector(this.velocity, delta_t);
        // this.mesh.rotateOnAxis(this.rotational_axis, .05);

        //this.check_walls(chamber_edge_length);

    }
}

export default Molecule;