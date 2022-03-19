// Import libraries
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js";
import rhino3dm from "https://cdn.jsdelivr.net/npm/rhino3dm@7.11.1/rhino3dm.module.js";
import { RhinoCompute } from "https://cdn.jsdelivr.net/npm/compute-rhino3d@0.13.0-beta/compute.rhino3d.module.js";
import { Rhino3dmLoader } from "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js";

const definitionName = "Lewis_Final_Iteration 3.gh";

// Set up sliders
const u1_slider = document.getElementById("u1");
u1_slider.addEventListener("mouseup", onSliderChange, false);
u1_slider.addEventListener("touchend", onSliderChange, false);

const v1_slider = document.getElementById("v1");
v1_slider.addEventListener("mouseup", onSliderChange, false);
v1_slider.addEventListener("touchend", onSliderChange, false);

const x2_slider = document.getElementById("x2");
x2_slider.addEventListener("mouseup", onSliderChange, false);
x2_slider.addEventListener("touchend", onSliderChange, false);

const y2_slider = document.getElementById("y2");
y2_slider.addEventListener("mouseup", onSliderChange, false);
y2_slider.addEventListener("touchend", onSliderChange, false);

const x3_slider = document.getElementById("x3");
x3_slider.addEventListener("mouseup", onSliderChange, false);
x3_slider.addEventListener("touchend", onSliderChange, false);

const y3_slider = document.getElementById("y3");
y3_slider.addEventListener("mouseup", onSliderChange, false);
y3_slider.addEventListener("touchend", onSliderChange, false);

const z4_slider = document.getElementById("z4");
z4_slider.addEventListener("mouseup", onSliderChange, false);
z4_slider.addEventListener("touchend", onSliderChange, false);

//////////////////////GET POINTS///////////////////////////


///////////////////// DOWNLOAD BUTTON /////////////////////
const downloadButton = document.getElementById("downloadButton")
downloadButton.onclick = download

///////////////////// 3DM LOADER ///////////////////////
const loader = new Rhino3dmLoader();
loader.setLibraryPath("https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/");

let rhino, definition, doc;
rhino3dm().then(async (m) => {
  console.log("Loaded rhino3dm.");
  rhino = m; // global

  //RhinoCompute.url = getAuth( 'RHINO_COMPUTE_URL' ) // RhinoCompute server url. Use http://localhost:8081 if debugging locally.
  //RhinoCompute.apiKey = getAuth( 'RHINO_COMPUTE_KEY' )  // RhinoCompute server api key. Leave blank if debugging locally.

  RhinoCompute.url = "http://localhost:8081/"; //if debugging locally.

  // load a grasshopper file!

  const url = definitionName;
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const arr = new Uint8Array(buffer);
  definition = arr;

  init();
  compute();
});

async function compute() {
  const param1 = new RhinoCompute.Grasshopper.DataTree("u1");
  param1.append([0], [u1_slider.valueAsNumber]);

  const param2 = new RhinoCompute.Grasshopper.DataTree("v1");
  param2.append([0], [v1_slider.valueAsNumber]);

  const param3 = new RhinoCompute.Grasshopper.DataTree("x2");
  param3.append([0], [x2_slider.valueAsNumber]);

  const param4 = new RhinoCompute.Grasshopper.DataTree("y2");
  param4.append([0], [y2_slider.valueAsNumber]);

  const param5 = new RhinoCompute.Grasshopper.DataTree("x3");
  param5.append([0], [x3_slider.valueAsNumber]);

  const param6 = new RhinoCompute.Grasshopper.DataTree("y3");
  param6.append([0], [y3_slider.valueAsNumber]);

  const param7 = new RhinoCompute.Grasshopper.DataTree("z4");
  param7.append([0], [z4_slider.valueAsNumber]);

  // clear values
  const trees = [];
  trees.push(param1);
  trees.push(param2);
  trees.push(param3);
  trees.push(param4);
  trees.push(param5);
  trees.push(param6);
  trees.push(param7);

  const res = await RhinoCompute.Grasshopper.evaluateDefinition(
    definition,
    trees
  );


  //console.log(res);

  doc = new rhino.File3dm();

  // hide spinner
  document.getElementById("loader").style.display = "none";

  //decode grasshopper objects and put them into a rhino document
  for (let i = 0; i < res.values.length; i++) {
    for (const [key, value] of Object.entries(res.values[i].InnerTree)) {
      for (const d of value) {
        const data = JSON.parse(d.data);
        const rhinoObject = rhino.CommonObject.decode(data);
        doc.objects().add(rhinoObject, null);
      }
    }
  }



  // go through the objects in the Rhino document

  let objects = doc.objects();
  for ( let i = 0; i < objects.count; i++ ) {
  
    const rhinoObject = objects.get( i );


     // asign geometry userstrings to object attributes
    if ( rhinoObject.geometry().userStringCount > 0 ) {
      const g_userStrings = rhinoObject.geometry().getUserStrings()
      rhinoObject.attributes().setUserString(g_userStrings[0][0], g_userStrings[0][1])
      
    }
  }


  // clear objects from scene
  scene.traverse((child) => {
    if (!child.isLight) {
      scene.remove(child);
    }
  });

  const buffer = new Uint8Array(doc.toByteArray()).buffer;
  loader.parse(buffer, function (object) {

    // go through all objects, check for userstrings and assing colors

    object.traverse((child) => {
      if (child.isLine) {

        if (child.userData.attributes.geometry.userStringCount > 0) {
          
          //get color from userStrings
          const colorData = child.userData.attributes.userStrings[0]
          const col = colorData[1];

          //convert color from userstring to THREE color and assign it
          const threeColor = new THREE.Color("rgb(" + col + ")");
          const mat = new THREE.LineBasicMaterial({ color: threeColor });
          child.material = mat;
        }
      }
    });

    ///////////////////////////////////////////////////////////////////////
    // add object graph from rhino model to three.js scene
    scene.add(object);

  });
}

function onSliderChange() {
  // show spinner
  document.getElementById("loader").style.display = "block";
  compute();
}


// THREE BOILERPLATE //
let scene, camera, renderer, controls;

function init() {
  // create a scene and a camera
  scene = new THREE.Scene()
    scene.background = new THREE.Color(1,1,1)
    camera = new THREE.PerspectiveCamera( 85, window.innerWidth / window.innerHeight, 0.1, 1000 )
    camera.position.z = 1000

  // create the renderer and add it to the html
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // add some controls to orbit the camera
  controls = new OrbitControls(camera, renderer.domElement);

  // add a directional light
  const directionalLight = new THREE.DirectionalLight( 0xffffff )
    directionalLight.position.set( 0, 0, 2 )
    directionalLight.castShadow = true
    directionalLight.intensity = 2
    scene.add( directionalLight )

    const directionalLight2 = new THREE.DirectionalLight( 0xffffff )
    directionalLight2.position.set( 0, 0, -2 )
    directionalLight2.castShadow = true
    directionalLight2.intensity = 1.7
    scene.add( directionalLight2 )

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  animate();
}

function meshToThreejs(mesh, material) {
  const loader = new THREE.BufferGeometryLoader();
  const geometry = loader.parse(mesh.toThreejsJSON());
  return new THREE.Mesh(geometry, material);
}

// download button handler
function download () {
  let buffer = doc.toByteArray()
  let blob = new Blob([ buffer ], { type: "application/octect-stream" })
  let link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = 'Lewis_Final_Iteration 3.3dm'
  link.click()
}