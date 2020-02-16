class Molecule {
    constructor(name, geometry, material) {
        this.name = name;

        this.mesh = new THREE.Mesh(geometry, material)

        this.velocity = new THREE.Vector3(
            d3.randomNormal(0.0)(.001),
            d3.randomNormal(0.0)(.001),
            d3.randomNormal(0.0)(.001));

        this.rotational_axis = new THREE.Vector3(-2, 1, 1).normalize();
    }


    update() {
            //add velocity to current position.
            //this.velocity = new THREE.Vector3()

        // Movement
        // if (this.molecule.x) {

        // }

        this.mesh.position.add(this.velocity);
        // Rotation

        this.mesh.rotateOnAxis(this.rotational_axis, .05);

        //return console.log()
    }


}

export default Molecule;