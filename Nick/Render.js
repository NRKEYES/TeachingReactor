let width_for_3d = width;
let height_for_3d = 600;


let COLORS = {'1': 0xFCF6B1,
              '6': 0x233D4D,
              '79': 0xD0A301}


let renderer = new THREE.WebGLRenderer({alpha: true, antialiasing: true});
renderer.setClearColor( 0x000000, 0 );
renderer.domElement.style.position = 'absolute';
renderer.setSize(  width_for_3d,  height_for_3d );

let camera = new THREE.PerspectiveCamera( 90,
                                        width_for_3d/height_for_3d,
                                        0.1,
                                        1000 );
camera.position.z = 20;

let scene = new THREE.Scene();
scene.position.x =0;
scene.position.y =0;
scene.position.z = 0;

let pointLight = new THREE.PointLight( 0xFBFCF6 );
pointLight.position.x = 20;
pointLight.position.z = 30
scene.add(pointLight);


container = document.getElementById('threeD');
container.appendChild(renderer.domElement);



let atom_radius = {1:0.53,2:0.31,3:1.67,4:1.12,5:0.87,6:0.67,7:0.56,8:0.48,9:0.42,10:0.38,11:1.9,12:1.45,13:1.18,
                    14:1.11,15:0.98,16:0.88,17:0.79,18:0.71,19:2.43,20:1.94,21:1.84,22:1.76,23:1.71,24:1.66,25:1.61,
                    26:1.56,27:1.52,28:1.49,29:1.45,30:1.42,31:1.36,32:1.25,33:1.14,34:1.03,35:0.94,36:0.88,37:2.65,
                    38:2.19,39:2.12,40:2.06,41:1.98,42:1.9,43:1.83,44:1.78,45:1.73,46:1.69,47:1.65,48:1.61,49:1.56,
                    50:1.45,51:1.33,52:1.23,53:1.15,54:1.08,55:2.98,56:2.53,57:1.95,71:2.17,72:2.08,73:2,74:1.93,
                    75:1.88,76:1.85,77:1.8,78:1.77,79:1.0,80:1.71,81:1.56,82:1.54,83:1.43,84:1.35,85:1.27,86:1.2,
                    89:1.95,90:1.8,91:1.8,92:1.75,93:1.75,94:1.75,95:1.75}

let spheres = [];



function render(local_x,local_y,atoms, coords){
  let theta = 0;
  spheres.forEach(function(s){ scene.remove(s) });

  centerX = coords[0][0];
  centerY = coords[0][1];
  centerZ = coords[0][2];
  for(var i=0; i< coords.length; i++){

    let material = new THREE.MeshToonMaterial({  color: COLORS[atoms[i]] ,
                                                		flatShading: false});

    let geometry = new THREE.SphereGeometry( atom_radius[atoms[i]], 20, 20);
    let sphere = new THREE.Mesh( geometry, material);


    sphere.position.set(coords[i][0]-centerX,
                        coords[i][1]-centerY,
                        coords[i][2]-centerZ);
    spheres.push(sphere);
    scene.add(sphere);
  };

  function animate() {
    requestAnimationFrame( animate );
    renderer.render(scene, camera);

    camera.position.x = 10*math.cos(theta);
    camera.position.y = 5*math.sin(theta);
    camera.position.z = 10*math.sin(theta);
    theta+= .03;


    pointLight.position.x = 10*math.cos(theta);
    pointLight.position.y = 20*math.sin(theta);
    pointLight.position.z = 10*math.sin(theta);
    camera.lookAt(scene.position);
  }
  animate();
}
