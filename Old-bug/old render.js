var COLORS = {
    "H": 0xC0C0C0,
    "C": 0x000000,
    "Au": 0xD4AF37,
    "Al": 0x00334d,
    "V": 0xff26d4,
    "O": 0xff0000,
    "N": 0x0033cc
};

var atom_radius = {
    "H": 0.37 * 1.5, // Rendered slightly bigger than they need to be
    "C": 0.77,
    "Au": 1.44,
    "Al": 1.18,
    "V": 1.25,
    "O": 0.73,
    "N": .75
};


var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};




background_and_emis = 0x00fffa;

var height_for_3d = document.getElementById("threeD").clientHeight;
var width_for_3d = document.getElementById("threeD").clientWidth;
var background_color_for_3d = "#EDF5E1";


var clock = new THREE.Clock();
var controls;

var spheres = [];
var origin = [];

var frame_number = 0;
var frame_max = 0;
var frame_step = 1;
var reset = false;


var xyz_dict = {};



function myFunction() {
    document.getElementById("menu").classList.toggle("show")

}



d3.json("list.json", function(error, list_of_files) {
    if (error) throw error;

    d3.select('ul')
        .selectAll('li.filenames')
        .data(list_of_files['filename'])
        .enter()
        .append('li')
        .text(d => d)
        .on('click', function(d) {
            reset = true;
            d3.select('.file-name').text(d)
            myFunction()
            load_file(d);

        });


});


function load_file(filename) {
    console.log(filename)
    xyz_dict = {} //blank out dictionary of steps

    d3.json('Trajectories/' + filename, function(error, json_xyz) {
        if (error) throw error;

        json_xyz['frames'].forEach(function(data) {
            xyz_dict[data['id']] = data['xyz']
        });

        console.log(xyz_dict[0])
        origin = get_coords(xyz_dict[0]);
        origin = origin[0];
        console.log(Object.keys(xyz_dict).length - 1)
        frame_max = Object.keys(xyz_dict).length - 2;

        frame_number = 1;
        frame_step = 1;
        add_molecule(xyz_dict[0])
    });
}





function init() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(background_and_emis, .5)
    renderer.domElement.style.position = 'absolute';
    renderer.setSize(width_for_3d, height_for_3d);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;


    scene = new THREE.Scene();


    camera = new THREE.PerspectiveCamera(30, width_for_3d / height_for_3d, 1, 2000);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 500
    controls.maxPolarAngle = Math.PI;

    scene = new THREE.Scene();
    scene.position.x = 0;
    scene.position.y = 0;
    scene.position.z = 0;




    camera.lookAt(scene.position)



    var directionalLight = new THREE.DirectionalLight(0xffffff, .5);
    directionalLight.position.set(100, -100, 0);
    scene.add(directionalLight);
    var directionalLight2 = new THREE.DirectionalLight(0xffffff, .5);
    directionalLight.position.set(0, 100, -100);
    scene.add(directionalLight2);

    sunLight = new THREE.SpotLight(0xffffff, .5);
    sunLight.position.set(-100, 0, 100);
    //sunLight.castShadow = true;
    scene.add(sunLight);



    container = document.getElementById('threeD');
    container.appendChild(renderer.domElement);

}




function get_coords(text_coord) {

    let atoms = [];
    let coords = [];

    text_coord.forEach(function(row) {

        let a = row.split(/\b\s+/);
        atoms.push(a[0]);

        new_coord = (new THREE.Vector3((+a[1]),
            (+a[2]),
            (+a[3])))
        coords.push(new_coord);
    });
    return coords;
}


function animate() {

    setTimeout(function() {
        requestAnimationFrame(animate);
    }, 1000 / 200); // delay in ms



    if (Object.keys(xyz_dict).length > 2) { // only tries to animate if there are more than 2 frames.
        d3.select('.frame-number').text(frame_number)
        current_frame = get_coords(xyz_dict[frame_number])
        next_frame = get_coords(xyz_dict[frame_number + 1]);



        for (i = 0; i < next_frame.length; i++) {
            deltaX = next_frame[i].x - spheres[i].position.x;
            deltaY = next_frame[i].y - spheres[i].position.y;
            deltaZ = next_frame[i].z - spheres[i].position.z;


            spheres[i].position.x += deltaX;
            spheres[i].position.y += deltaY;
            spheres[i].position.z += deltaZ;
        }


        frame_number = frame_number + frame_step;
        if ((frame_number >= frame_max) || (frame_number <= 0)) {
            frame_step = frame_step * -1;
        }
    }





    controls.update();
    renderer.render(scene, camera);
}




function add_molecule(all_data) {
    let scale = 1;
    let sphere_scale = scale;
    let distance_scale = sphere_scale * 1.5;

    spheres.forEach(function(d) {
        scene.remove(d)
    });
    spheres = [];

    let local_x = 0;
    let local_y = 0;
    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;
    let atoms = [];
    let coords = [];



    var envMap = new THREE.TextureLoader().load('envMap.png');
    envMap.mapping = THREE.SphericalReflectionMapping;



    all_data.forEach(function(row) {
        let a = row.split(/\b\s+/);
        atoms.push(a[0]);

        shrink = 1;
        new_coord = (new THREE.Vector3((+a[1] - origin.x) * distance_scale,
            (+a[2] - origin.y) * distance_scale,
            (+a[3] - origin.z) * distance_scale));
        coords.push(new_coord);
    });


    var rough = new THREE.TextureLoader().load('rough.jpg');
    //rough.mapping = THREE.SphericalReflectionMapping;


    for (let i = 0; i < coords.length; i++) {
        let material = new THREE.MeshPhysicalMaterial({
            color: COLORS[atoms[i]],
            emissive: COLORS[atoms[i]],
            metalness: .0,
            roughness: 0.1,
            clearCoat: 1.0,
            clearCoatRoughness: 0.0,
            reflectivity: 1.0,
            envMap: envMap,
            //bumpMap: rough,
            //opacity: .95,
            //transparent: true,
            //color: 0x000000,//Bright black background
            color: 0xa8f4f7, // Easter glow :Y
            // color: COLORS[atoms[i]],
            // metalness: 0.5,
            // roughness: .2,
            // clearCoat: 1.0,
            // clearCoatRoughness: 0.2,
            //
            // emissive: COLORS[atoms[i]],
            // envMap: envMap,
            // roughnessMap = rough,
            // shininess: 1000.0,
        })



        let sphereGeometry = new THREE.SphereGeometry(atom_radius[atoms[i]] * sphere_scale, 30, 30);
        let sphereMesh = new THREE.Mesh(sphereGeometry);
        sphereMesh.updateMatrix();


        //sphereGeometry.translate();
        let sphere = new THREE.Mesh(sphereGeometry, material);
        sphere.position.set(coords[i].x, coords[i].y, coords[i].z);

        spheres.push(sphere);
        scene.add(sphere);
    }
    reset = false;
    animate();
}

init();