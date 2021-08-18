// Copyright: VIDA Lab Inc.
// License: BSD
// Last update: 01/14/2014

// custom d3 javascript

/*--- IMPORTANT GUIDELINES ---
1. Use div #canvas-svg for svg rendering
    var svg = d3.select("#canvas-svg");
2. 'data' variable contains JSON data from Data tab
    Do NOT overwrite this variable
3. To define customizable properties, use capitalized variable names,
    and define them in Properties tab ---*/

var WIDTH = config.width, HEIGHT = config.height;

var COLOR = config.nodeColor;
var LINK_COLOR = config.linkColor;

var scene = new THREE.Scene();

// set some camera attributes
var VIEW_ANGLE = 45,
  ASPECT = WIDTH / HEIGHT,
  NEAR = 0.1,
  FAR = 10000;

// get the DOM element to attach to
// - assume we've got jQuery to hand
var $container = $('#canvas-svg');

// create a WebGL renderer, camera
// and a scene
var renderer = new THREE.WebGLRenderer({alpha: true,
              antialiasing: true});

renderer.setClearColor( 0x000000, 0 );

var camera =
  new THREE.PerspectiveCamera(
    VIEW_ANGLE,
    ASPECT,
    NEAR,
    FAR);

var scene = new THREE.Scene();

// add the camera to the scene
scene.add(camera);

// the camera starts at 0,0,0
// so pull it back
camera.position.z = 300;

// start the renderer
renderer.setSize(WIDTH, HEIGHT);

// attach the render-supplied DOM element
$container.append(renderer.domElement);

var spheres = [], three_links = [];

// Define the 3d force
var force = d3.layout.force3d()
    .nodes(sort_data=[])
    .links(links=[])
    .size([50, 50])
    .gravity(0.3)
    .charge(config.charge)

var DISTANCE = 1

for (var i = 0; i < data.nodes.length; i++) {
  sort_data.push({x:data.nodes.x + DISTANCE,y:data.nodes.y + DISTANCE,z:0})

  // set up the sphere vars
  var radius = 5,
      segments = 16,
      rings = 16;

  // create the sphere's material
  var sphereMaterial = new THREE.MeshLambertMaterial(
      {
        color: COLOR
      });

  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(
      radius,
      segments,
      rings),
    sphereMaterial);

  spheres.push(sphere);

  // add the sphere to the scene
  scene.add(sphere);
}

for (var i = 0; i < data.links.length; i++) {
  links.push({target:sort_data[data.links[i].target],source:sort_data[data.links[i].source]});

  var material = new THREE.LineBasicMaterial({ color: LINK_COLOR,
                linewidth: 2});
  var geometry = new THREE.Geometry();

  geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
  geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
  var line = new THREE.Line( geometry, material );
  line.userData = { source: data.links[i].source,
                    target: data.links[i].target };
  three_links.push(line);
  scene.add(line);

  force.start();
}

// set up the axes
var x = d3.scale.linear().domain([0, 350]).range([0, 10]),
    y = d3.scale.linear().domain([0, 350]).range([0, 10]),
    z = d3.scale.linear().domain([0, 350]).range([0, 10]);

force.on("tick", function(e) {
  for (var i = 0; i < sort_data.length; i++) {
    spheres[i].position.set(x(sort_data[i].x) * 40 - 40, y(sort_data[i].y) * 40 - 40,0);

    for (var j = 0; j < three_links.length; j++) {
      var line = three_links[j];
      var vi = -1;
      if (line.userData.source === i) {
        vi = 0;
      }
      if (line.userData.target === i) {
        vi = 1;
      }

      if (vi >= 0) {
        line.geometry.vertices[vi].x = x(sort_data[i].x) * 40 - 40;
        line.geometry.vertices[vi].y = y(sort_data[i].y) * 40 - 40;
        line.geometry.verticesNeedUpdate = true;
      }
    }
  }

  renderer.render(scene, camera);
});

// create a point light
var pointLight = new THREE.PointLight( 0xFFFFFF );

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);

var rotSpeed = 0.01;
function checkRotation(){

    var x = camera.position.x,
        y = camera.position.y,
        z = camera.position.z;

    camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
    camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);

    camera.lookAt(scene.position);

}

function animate() {
    requestAnimationFrame(animate);

    checkRotation();

    renderer.render(scene, camera);
}

animate();
