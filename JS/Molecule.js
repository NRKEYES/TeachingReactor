class Molecule {
    constructor(name = 'molecule', mass = 0, coords, geometry, material, physics_geom, starting_position, velocity, rotational_velocity) {
        this.name = name;
        this.velocity = velocity;
        this.starting_position = starting_position;
        this.rotational_velocity = rotational_velocity;
        this.lifetime = 0;
        this.can_decompose = false;
        this.glows = [];

        // TODO make this way more flexible
        if (this.mass > 50) {
            this.can_decompose = true;
        }

        // console.log(velocity)

        //console.log(coords.length);
        this.coords = coords;
        this.mass = mass;
        this.velocity_mag = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2) + Math.pow(velocity.z, 2));;
        this.translational_energy = .5 * this.mass * Math.pow(this.velocity_mag, 2);
        this.rotational_energy = 0.0;
        this.total_energy = this.translational_energy + this.rotational_energy;

        this.radius = .1 * (this.coords.length - 1);


        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(starting_position.x, starting_position.y, starting_position.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(starting_position.x, starting_position.y, starting_position.z));
        //this.transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        this.motionState = new Ammo.btDefaultMotionState(this.transform);


        //TODO
        //TODO add aditional colshape method based on multiple spheres
        //TODO this might require a bit of a rewrite

        //this.colShape = new Ammo.btBvhTriangleMeshShape(mesh, true, true);
        // this.colShape = new Ammo.btConvexHullShape(geom, true, true);
        // this.colShape = new Ammo.btSphereShape(this.radius);
        this.colShape = new Ammo.btConvexHullShape(physics_geom, true, true);
        this.colShape.setMargin(0.05);
        //Don't really know what this is useful for...
        this.localInertia = new Ammo.btVector3(0.0, 0.0, 0.0);
        this.colShape.calculateLocalInertia(this.mass, this.localInertia);

        this.rbInfo = new Ammo.btRigidBodyConstructionInfo(
            this.mass,
            this.motionState,
            this.colShape,
            this.localInertia
        );
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