//Global variables
var renderer, scene, camera, octoMain, particle;
var partNum = 1000;
var spread;
//audio analyser variables
const AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx, audioElement, source, analyser, bufferLength, dataArray;
var particlesStored = [];
var cubes = [];
var cube;
var cos = Math.cos;
var sin = Math.sin;



//removes overlay to comply with new chrome autoplay tos
var startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', init );

//Execute the main functions when the page loads
function init(){
  // removes overlay for new chrome autoplay t&s
  var overlay = document.getElementById( 'overlay' );
  overlay.remove();

//Audio handling
audioCtx = new AudioContext();
//selecting what the analyser will use as an audio source
audioElement = document.querySelector('audio');
//play the audio and adjust the volume
audioElement.play();
audioElement.volume = 0.1;
//audio handling
source = audioCtx.createMediaElementSource(audioElement)
analyser = audioCtx.createAnalyser();
source.connect(analyser);
source.connect(audioCtx.destination);
analyser.fftSize = 256;
bufferLength = analyser.frequencyBinCount;
console.log({ bufferLength })
dataArray = new Uint8Array(bufferLength);
//storing audio data into an array
analyser.getByteFrequencyData(dataArray);

  // Create an empty scene
  scene = new THREE.Scene();

  // Create a basic perspective camera and set the position up
  camera = new THREE.PerspectiveCamera( 65, window.innerWidth/window.innerHeight, 1, 1000 );
  camera.position.z = 350;
  camera.position.x = 150;
  camera.position.y = -300;
  scene.add(camera);

  // Create the lights
  var ambientLight = new THREE.AmbientLight(0x999999, 0.5);
  scene.add(ambientLight);
  var lights = [];
  lights[0] = new THREE.DirectionalLight( 0xffffff, 0.5);
  lights[0].position.set(1, 0, 0);
  //top light
  lights[1] = new THREE.DirectionalLight( 0x333333, 1);
  lights[1].position.set(0.75, 1, 0.5);
  //bottom light
  lights[2] = new THREE.DirectionalLight( 0x000000, 1);
  lights[2].position.set(-0.75, -1, 0.5);
  //add lights to scene
  scene.add(lights[0]);
  scene.add( lights[1] );
  scene.add( lights[2] );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.autoClear = false;
  document.getElementById('canvas').appendChild(renderer.domElement);

  //DAT GUI
    var params = {
        color: 0xffffff
    };

    var params2 = {
      color: 0x4989d2
    }
//init the gui
    var gui = new dat.GUI();

//add folders to the gui and options to change
    var planet = gui.addFolder( "Planet" );
    planet.addColor( params, 'color' )
          .onChange( function() { octoMesh.material.color.set( params.color ); } );
    planet.open();

    var stars = gui.addFolder( "Stars" );
    stars.addColor( params2, 'color' )
          .onChange( function() { mesh.material.color.set( params2.color ); } );
    stars.open();

//orbit controls so the user can move around the scene
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);


// creating the planet  shape and material
octoMain = new THREE.Object3D();
var geometryOcto = new THREE.IcosahedronGeometry(5, 2);
scene.add(octoMain);

var octoMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.FlatShading });

//add the geometry and material into one then add them into the 3D object
var octoMesh = new THREE.Mesh(geometryOcto, octoMaterial);
octoMesh.scale.x = octoMesh.scale.y = octoMesh.scale.z = 16;
octoMain.add(octoMesh);

//creating the particles by addings a geometry and a material together multiple times
//using the for loop that loops 1500 times creating particles with a random position to
//create the illusion of stars

//settings up the 3D object geometry and material
particle = new THREE.Object3D();
scene.add(particle);
var particleGeo = new THREE.TetrahedronGeometry(1, 1);
var particleMat = new THREE.MeshPhongMaterial({ color: 0x4989d2, shading: THREE.FlatShading });

//for loop that loops 1500 times creating the particles
for (var i = 0; i < 1500; i++) {
  var mesh = new THREE.Mesh(particleGeo, particleMat);
  mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
  mesh.position.multiplyScalar(500);
  mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
  particle.add(mesh);
}


//Create a two dimensional grid of objects, and position them accordingly
for (var x = -200; x <= 200; x += 5) {

  //optional geometry
    // var boxGeometry = new THREE.BoxGeometry(1, 1, 1);

  //main geometry
    var boxGeometry = new THREE.SphereGeometry( 0.7, 32, 32 );
    //The material is assigned a random color
    var boxMaterial = new THREE.MeshLambertMaterial({color: Math.random() * 0xFFFFFF});
    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    // 3d object positions before animation loop
    box.position.x = x;
    box.position.z = Math.random() - 0.5;
    box.position.y = Math.random() - 0.5;

// settings up what shape i want to use as my planetary ring
    //pin
    box.scale.x = dataArray[x + 524] / 20;

    //cube
    // box.scale.y = dataArray[x + 524] / 20;

//add the 3d planetary ring to the scene
    scene.add(box);
    cubes.push(box);
}

//calling the animation loop in the init so it starts when the project starts
animate();
//end of init
}




// Render Loop
function animate(){
  requestAnimationFrame(animate);
  //gathering the data from the audio array
  analyser.getByteFrequencyData(dataArray);

//for every 3d object in the cubes array gather the data from the audio array and use it to adjust the objects position and scale
  cubes.forEach(function(cube, i) {
    var v = (i + 3000 + dataArray[i] * 0.5) * 0.05;
    //using cos and sin to adjust the position of the "cubes" into a ring
    cube.position.y += ((cos(i * 100) * v) - cube.position.y);
    cube.position.x += ((sin(i * 100) * v) - cube.position.x);
    //seting the angle of the "cubes"
    cube.rotation.y = 2;
    cube.rotation.x = 1.5;

//setting what shape i want to use, you can change this by swapping what shape is commented out
//pin
    cube.scale.x = dataArray[i] / 10;
    cube.scale.y = dataArray[i] / 10;
//cubes
    // cube.scale.y = dataArray[i] / 10;
    // cube.scale.z = dataArray[i] / 10;
  })


//setting the rotation of the whole 3d object not the individual particles as this makes them spin together around the planet
  particle.rotation.x += 0.00035;
  particle.rotation.y -= 0.00035;

  // planet rotation animation
  octoMain.rotation.x += 0.0003;
  octoMain.rotation.y += 0.0003;



  // Render the scene
  renderer.clear();
  renderer.render(scene, camera);
}


//Keep everything appearing properly on screen when window resizes
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix(); //maintain aspect ratio
  renderer.setSize(window.innerWidth, window.innerHeight);
}
