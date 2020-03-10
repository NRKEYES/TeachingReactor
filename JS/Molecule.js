class Molecule {
    constructor(coords, geometry, material, chamber_edge_length) {
        //console.log(coords.length);
        this.coords = coords;
        this.mass_factor = this.coords.length;
        this.mass = this.mass_factor;
        this.radius = .1 * (this.coords.length - 1);

        let pos = {
            x: d3.randomUniform(-chamber_edge_length / 2, chamber_edge_length / 2)(),
            y: d3.randomUniform(-chamber_edge_length / 2, chamber_edge_length / 2)(),
            z: d3.randomUniform(-chamber_edge_length / 2, chamber_edge_length / 2)()
        };


        let velocity = {
            x: d3.randomNormal(0.0)(1),
            y: d3.randomNormal(0.0)(1),
            z: d3.randomNormal(0.0)(1)
        };

        let quat = {
            x: d3.randomNormal(0.0)(1),
            y: d3.randomNormal(0.0)(1),
            z: d3.randomNormal(0.0)(1),
            w: 1
        };

        let rot = {
            x: d3.randomNormal(0.0)(3, 14),
            y: d3.randomNormal(0.0)(3.14),
            z: d3.randomNormal(0.0)(3.14)
        };
        // geometry.computeFaceNormals();
        geometry.computeBoundingSphere();
        geometry.center();


        let geom = new THREE.Geometry().fromBufferGeometry(geometry)
        geom.mergeVertices();
        //console.log(geom);
        const vertices = geom.vertices;
        // const indices = geom.indices;
        const indices = geom.vertices.length;
        const scale = [1, 1, 1];



        const mesh = new Ammo.btTriangleMesh(true, true);
        mesh.setScaling(new Ammo.btVector3(scale[0], scale[1], scale[2]));
        for (let i = 0; i < indices; i = i + 3) {
            mesh.addTriangle(
                new Ammo.btVector3(vertices[i].x, vertices[i].y, vertices[i].z),
                new Ammo.btVector3(vertices[i + 1].x, vertices[i + 1].y, vertices[i + 1].z),
                new Ammo.btVector3(vertices[i + 2].x, vertices[i + 2].y, vertices[i + 2].z),
                true
            );

        }

        geom.computeBoundingSphere();
        geom.center();
        this.mesh = new THREE.Mesh(geom, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(pos.x, pos.y, pos.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;




        //Ammojs Section
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        //this.transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        this.motionState = new Ammo.btDefaultMotionState(this.transform);




        //this.colShape = new Ammo.btBvhTriangleMeshShape(mesh, true, true);
        // this.colShape = new Ammo.btConvexHullShape(geom, true, true);
        this.colShape = new Ammo.btConvexHullShape(mesh, true, true);

        // this.colShape = new Ammo.btSphereShape(this.radius);
        //this.colShape.setMargin(0.5);

        this.localInertia = new Ammo.btVector3(1.0, 0, 0);

        this.colShape.calculateLocalInertia(this.mass, this.localInertia);

        this.rbInfo = new Ammo.btRigidBodyConstructionInfo(this.mass, this.motionState, this.colShape, this.localInertia);
        this.body = new Ammo.btRigidBody(this.rbInfo);
        //prevents physics deactivation
        // haven't explored this much
        this.body.setActivationState(4);

        let vel_vec = new Ammo.btVector3(velocity.x, velocity.y, velocity.z);
        this.body.setLinearVelocity(vel_vec);

        let rot_vec = new Ammo.btVector3(rot.x, rot.y, rot.z);
        this.body.setAngularVelocity(rot_vec);





        // Very basic collision parameters
        // Something here may be causing acceleration(excessive acceleration)
        this.body.setFriction(0);
        this.body.setRestitution(0.95);
        this.body.setDamping(0.0, 0.0);



        this.mesh.userData.physicsBody = this.body;
        this.mesh.userData.molecule = this;
        //set the mesh name to be searchable by 'pointer'
        this.mesh.name = this.body.H;

        console.log(this);
        return this;

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

    reaction_check() {
        // console.log('Reaction Checker');
        // console.log(this.data[0]);

        let to_do = { 'add': { 'name': 0, 'num': 0 }, 'remove': { 'name': 1, 'num': 0 } };


        // Two reactions are possible
        // forward and backward

        // forward
        // Check to see if the other hit molecule was the same species
        // Spawn a product molecule
        //      set approprate momentum after impact
        // despawn two reactants

        // backward
        // despawn product
        // spawn in two reactants with half momentum each.


        if (this.mass_factor <= 3) {
            //console.log('Small Fry!')
            return to_do;
        } else {

            let percent_decompose = .01;
            percent_decompose = percent_decompose * this.delta_t;
            let random_num = d3.randomUniform(0, 1)();

            //console.log(random_num);
            if (random_num < percent_decompose) {
                //decompose
                // console.log("we should decompose!")
                // console.log(percent_decompose);
                // console.log(this.data[0].count.slice(-1)[0] + 2)

                //this.data[0].count.push(this.data[0].count.slice(-1)[0] + 2);

                // number to add
                //console.log(this.mass_factor)
                let to_do = { 'add': { 'name': 0, 'num': 2 }, 'remove': { 'name': 1, 'num': 1 } };
                return to_do;
            }

        }
        return to_do;
    }

    update(incoming_data, delta_t) {
        this.data = incoming_data;
        this.delta_t = delta_t;



        return this.reaction_check();
    }
}

export default Molecule;