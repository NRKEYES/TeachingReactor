class Molecule {
    constructor(name, geometry, material) {
        this.name = name;

        // geometry.computeFaceNormals();
        // geometry.computeBoundingSphere();
        // geometry.center();



        this.mesh = new THREE.Mesh(geometry, material);

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


        // this.mesh.castShadow = true;
        // this.mesh.receiveShadow = true;


        this.velocity = new THREE.Vector3(
            d3.randomNormal(0.0)(.0000001),
            d3.randomNormal(0.0)(.0000001),
            d3.randomNormal(0.0)(.0000001));

        this.rotational_axis = new THREE.Vector3(
                d3.randomNormal(0.0)(1),
                d3.randomNormal(0.0)(1),
                d3.randomNormal(0.0)(1))
            .normalize();


    }

    tick() {
        this.mesh.position.set(
            d3.randomNormal(0.0)(.33),
            d3.randomNormal(0.0)(.33),
            d3.randomNormal(0.0)(.33));

    }


    update() {
        //console.log('update')

        // Movement
        // if (this.molecule.x) {

        // }

        //this.mesh.position.add(this.velocity);
        // // Rotation

        this.mesh.rotateOnAxis(this.rotational_axis, .05);

        //return console.log()
    }


}

export default Molecule;