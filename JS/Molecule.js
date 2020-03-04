class Molecule {
    constructor(name, geometry, material, chamber_edge_length) {
        this.name = name;
        this.radius = .01 * (this.name.length - 1);

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



        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(pos.x, pos.y, pos.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        let mass_factor = this.name.length;
        this.mass = mass_factor;

        //Ammojs Section
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        this.transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        this.motionState = new Ammo.btDefaultMotionState(this.transform);

        this.colShape = new Ammo.btSphereShape(this.radius);
        this.colShape.setMargin(0.5);

        this.localInertia = new Ammo.btVector3(0, 0, 0);

        this.colShape.calculateLocalInertia(this.mass, this.localInertia);

        this.rbInfo = new Ammo.btRigidBodyConstructionInfo(this.mass, this.motionState, this.colShape, this.localInertia);
        this.body = new Ammo.btRigidBody(this.rbInfo);

        this.mesh.userData.physicsBody = this.body;



        let vel_vec = new Ammo.btVector3(velocity.x, velocity.y, velocity.z);
        this.body.setLinearVelocity(vel_vec);
        this.body.setFriction(0)
            //this.body.setLinearFactor(vel_vec);
            //this.body.applyCentralImpulse(vel_vec);
            //this.body.applyImpulse(vel_vec);
        let rot_vec = new Ammo.btVector3(rot.x, rot.y, rot.z);
        this.body.setAngularVelocity(rot_vec);


        //prevents physics deactivation
        // haven't explored this much
        this.body.setActivationState(4);


        // Very basic collision parameters
        // Something here may be causing acceleration(excessive acceleration)
        this.body.setRestitution(0.9);
        this.body.setDamping(0.0, 0);





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


    }

    update() {

        this.reaction_check();

    }
}

export default Molecule;