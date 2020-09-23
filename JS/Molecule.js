class Molecule {
    constructor(name = 'molecule', mass = 0, coords, geometry, material, starting_position, velocity, rotational_velocity) {
        this.name = name;
        this.mass = mass;
        this.coords = coords;
        this.starting_position = starting_position;

        this.velocity = velocity;
        this.velocity_mag = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2) + Math.pow(velocity.z, 2));
        this.translational_energy = .5 * this.mass * Math.pow(this.velocity_mag, 2);

        this.rotational_velocity = rotational_velocity;
        this.rotational_energy = 0.0;

        this.total_energy = this.translational_energy + this.rotational_energy;

        this.lifetime = 0;
        this.can_decompose = false;
<<<<<<< HEAD
<<<<<<< HEAD
        this.glows = [];


        // TODO make this way more flexible
=======
>>>>>>> parent of 1a069fd... Heading home- push
=======
>>>>>>> parent of 1a069fd... Heading home- push
        if (this.mass > 50) {
            this.can_decompose = true;
        }


        // const vertices = geometry.vertices;
        // const scale = [1, 1, 1];
        // const trig_mesh = new Ammo.btTriangleMesh(true, true);
        // trig_mesh.setScaling(new Ammo.btVector3(scale[0], scale[1], scale[2]));
        // for (let i = 0; i < geometry.vertices.length; i = i + 3) {
        //     trig_mesh.addTriangle(
        //         new Ammo.btVector3(vertices[i].x, vertices[i].y, vertices[i].z),
        //         new Ammo.btVector3(vertices[i + 1].x, vertices[i + 1].y, vertices[i + 1].z),
        //         new Ammo.btVector3(vertices[i + 2].x, vertices[i + 2].y, vertices[i + 2].z),
        //         true
        //     );
        // }

<<<<<<< HEAD
        //builds a reduced complexity hull
        let hull = new Ammo.btShapeHull(physics_geom);
        // hull.buildHull(.05);
        let result = new Ammo.btConvexHullShape(hull);

<<<<<<< HEAD

        //TODO
        //TODO add aditional colshape method based on multiple spheres
        //TODO this might require a bit of a rewrite

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.material.needsUpdate = true;
        this.colShape = new Ammo.btConvexHullShape(result, true, true);
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(starting_position.x, starting_position.y, starting_position.z));
=======




        this.radius = .1 * (this.coords.length - 1);

        // geometry.computeFaceNormals();
        geometry.computeBoundingSphere();
        geometry.center();

        //Convert Geometry into a triangle mesh that can be used in ammo for colision
        let geom = new THREE.Geometry().fromBufferGeometry(geometry)
        geom.mergeVertices(); // duplicate vertices are created with fromBufferGeometry()
        const vertices = geom.vertices;
        const scale = [1, 1, 1];

        const trig_mesh = new Ammo.btTriangleMesh(true, true);
        trig_mesh.setScaling(new Ammo.btVector3(scale[0], scale[1], scale[2]));
        for (let i = 0; i < geom.vertices.length; i = i + 3) {
            trig_mesh.addTriangle(
                new Ammo.btVector3(vertices[i].x, vertices[i].y, vertices[i].z),
                new Ammo.btVector3(vertices[i + 1].x, vertices[i + 1].y, vertices[i + 1].z),
                new Ammo.btVector3(vertices[i + 2].x, vertices[i + 2].y, vertices[i + 2].z),
                true
            );

=======




        this.radius = .1 * (this.coords.length - 1);

        // geometry.computeFaceNormals();
        geometry.computeBoundingSphere();
        geometry.center();

        //Convert Geometry into a triangle mesh that can be used in ammo for colision
        let geom = new THREE.Geometry().fromBufferGeometry(geometry)
        geom.mergeVertices(); // duplicate vertices are created with fromBufferGeometry()
        const vertices = geom.vertices;
        const scale = [1, 1, 1];

        const trig_mesh = new Ammo.btTriangleMesh(true, true);
        trig_mesh.setScaling(new Ammo.btVector3(scale[0], scale[1], scale[2]));
        for (let i = 0; i < geom.vertices.length; i = i + 3) {
            trig_mesh.addTriangle(
                new Ammo.btVector3(vertices[i].x, vertices[i].y, vertices[i].z),
                new Ammo.btVector3(vertices[i + 1].x, vertices[i + 1].y, vertices[i + 1].z),
                new Ammo.btVector3(vertices[i + 2].x, vertices[i + 2].y, vertices[i + 2].z),
                true
            );

>>>>>>> parent of 1a069fd... Heading home- push
        }


        geom.computeBoundingSphere();
        geom.center();
        geom.verticesNeedUpdate = true;
        this.mesh = new THREE.Mesh(geom, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
>>>>>>> parent of 1a069fd... Heading home- push
        this.mesh.position.set(starting_position.x, starting_position.y, starting_position.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;


<<<<<<< HEAD
<<<<<<< HEAD
        //this.transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        this.motionState = new Ammo.btDefaultMotionState(this.transform);
        this.colShape.setMargin(0.005);
        this.localInertia = new Ammo.btVector3(0.0, 0.0, 0.0);
        this.colShape.calculateLocalInertia(this.mass, this.localInertia); //Don't really know what this is useful for...


        this.rbInfo = new Ammo.btRigidBodyConstructionInfo(
            this.mass,
            this.motionState,
            this.colShape,
            this.localInertia
        );
=======
=======
>>>>>>> parent of 1a069fd... Heading home- push


        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(starting_position.x, starting_position.y, starting_position.z));
        //this.transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        this.motionState = new Ammo.btDefaultMotionState(this.transform);


        //TODO
        //add aditional colshape method based on multiple spheres
        // this might require a bit of a rewrite


        //this.colShape = new Ammo.btBvhTriangleMeshShape(mesh, true, true);
        // this.colShape = new Ammo.btConvexHullShape(geom, true, true);
        this.colShape = new Ammo.btConvexHullShape(trig_mesh, true, true);
        // this.colShape = new Ammo.btSphereShape(this.radius);
        this.colShape.setMargin(0.15);


        //Don't really know what this is useful for...
        this.localInertia = new Ammo.btVector3(0.0, 0.0, 0.0);
        this.colShape.calculateLocalInertia(this.mass, this.localInertia);
        this.rbInfo = new Ammo.btRigidBodyConstructionInfo(this.mass, this.motionState, this.colShape, this.localInertia);
<<<<<<< HEAD
>>>>>>> parent of 1a069fd... Heading home- push
=======
>>>>>>> parent of 1a069fd... Heading home- push
        this.body = new Ammo.btRigidBody(this.rbInfo);
        //prevents physics deactivation
        this.body.setActivationState(4);



        // Very basic collision parameters

        // Something here may be causing acceleration(excessive acceleration)
        let vel_vec = new Ammo.btVector3(velocity.x, velocity.y, velocity.z);
        this.body.setLinearVelocity(vel_vec);

        let rot_vec = new Ammo.btVector3(rotational_velocity.x, rotational_velocity.y, rotational_velocity.z);
        this.body.setAngularVelocity(rot_vec);

        this.body.setFriction(0);
        this.body.setRestitution(1.0);
        this.body.setDamping(0.0, 0.0);



        this.mesh.userData.physicsBody = this.body;
        this.mesh.userData.molecule = this;
        //set the mesh name to be searchable by 'pointer'
        this.mesh.name = this.body.H;

        // console.log(this);
        // console.log(hull);
        hull.__destroy__();
        physics_geom.dispose();
        geometry.dispose();
        // this.colShape.dispose();
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




        let percent_decompose = .01;
        percent_decompose = percent_decompose * this.delta_t;
        let random_num = d3.randomUniform(0, 1)();

        //console.log(random_num);
        if (random_num < percent_decompose) {
            console.log('Decompose.')
            return true;
        }


        return false;
    }

    update(delta_t) {

        this.lifetime = this.lifetime + delta_t;
        this.delta_t = delta_t;

        this.velocity_mag = Math.sqrt(
            Math.pow(this.mesh.userData.physicsBody.getLinearVelocity().x(), 2) +
            Math.pow(this.mesh.userData.physicsBody.getLinearVelocity().y(), 2) +
            Math.pow(this.mesh.userData.physicsBody.getLinearVelocity().z(), 2)
        );

        if (this.can_decompose) return this.reaction_check();
        return false;
    }
}

export default Molecule;