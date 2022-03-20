import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/3DMLoader.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'
import { TransformControls } from "https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/TransformControls.js";


// set up loader for converting the results to threejs
const loader = new Rhino3dmLoader()
loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/' )

// initialise 'data' object that will be used by compute()
const data = {
  definition: 'Lewis_Final_Iteration 3.gh',
  inputs: getInputs()
}

// setup input change events
const u1_slider = document.getElementById( 'u1' )
u1_slider.addEventListener( 'mouseup', onSliderChange, false )
u1_slider.addEventListener( 'touchend', onSliderChange, false )
const v1_slider = document.getElementById( 'v1' )
v1_slider.addEventListener( 'mouseup', onSliderChange, false )
v1_slider.addEventListener( 'touchend', onSliderChange, false )
const x2_slider = document.getElementById( 'x2' )
x2_slider.addEventListener( 'mouseup', onSliderChange, false )
x2_slider.addEventListener( 'touchend', onSliderChange, false )
const y2_slider = document.getElementById( 'y2' )
y2_slider.addEventListener( 'mouseup', onSliderChange, false )
y2_slider.addEventListener( 'touchend', onSliderChange, false )
const x3_slider = document.getElementById( 'x3' )
x3_slider.addEventListener( 'mouseup', onSliderChange, false )
x3_slider.addEventListener( 'touchend', onSliderChange, false )
const y3_slider = document.getElementById( 'y3' )
y3_slider.addEventListener( 'mouseup', onSliderChange, false )
y3_slider.addEventListener( 'touchend', onSliderChange, false )
const z4_slider = document.getElementById( 'z4' )
z4_slider.addEventListener( 'mouseup', onSliderChange, false )
z4_slider.addEventListener( 'touchend', onSliderChange, false )

let points = [];

// globals
let rhino, doc

rhino3dm().then(async m => {
    rhino = m

    init()
    rndPts()
    compute()
})

const downloadButton = document.getElementById("downloadButton")
downloadButton.onclick = download

////////POINTS!!!/////////////

function rndPts() {
  // generate initial points

  const startPts = [
    {x: -530.39, y: 402.95, z: 48.44},
    {x: -413.10, y: 403.32, z: 59.47},
    {x: -337.51, y: 386.02, z: 70.03}, 
    {x: -262.22, y: 389.58, z: 78.42}, 
    {x: -181.43, y: 425.82, z: 81.18}, 
    {x: -88.50, y: 404.49, z: 93.93}, 

  ]
  
  const cntPts = startPts.length

  for (let i = 0; i < cntPts; i++) {
    const x = startPts[i].x
    const y = startPts[i].y
    const z = startPts[i].z

    const pt = "{\"X\":" + x + ",\"Y\":" + y + ",\"Z\":" + z + "}"

    console.log( `x ${x} y ${y} z ${z}`)

    points.push(pt)
  
    //viz in three
      const icoGeo = new THREE.IcosahedronGeometry(0.1);
      const icoMat = new THREE.MeshNormalMaterial();
      const ico = new THREE.Mesh(icoGeo, icoMat);
      ico.name = "ico";
      ico.position.set(x, y, z);
      scene.add(ico);
  
      let tcontrols = new TransformControls(camera, renderer.domElement);
      tcontrols.enabled = true;
      tcontrols.attach(ico);
      //tcontrols.showZ = false;
      tcontrols.addEventListener("dragging-changed", onChange);
      scene.add(tcontrols);

  }
}  
  let dragging = false
  function onChange() {
    dragging = ! dragging
    if ( !dragging ) {
      // update points position
      points = []
      scene.traverse(child => {
        if ( child.name === 'ico' ) {
          const pt = "{\"X\":" + child.position.x + ",\"Y\":" + child.position.y + ",\"Z\":" + child.position.z + "}"
          points.push( pt )
          console.log(pt)
        }
      }, false)
  
      compute();
  
      controls.enabled = true;
      return;
    }
  
    controls.enabled = false;
  }
  /////////////////////////////////////////////////////////////////////////////
 //                            HELPER  FUNCTIONS                            //
/////////////////////////////////////////////////////////////////////////////

/**
 * Gets <input> elements from html and sets handlers
 * (html is generated from the grasshopper definition)
 */
function getInputs() {
  const inputs = {}
  for (const input of document.getElementsByTagName('input')) {
    switch (input.type) {
      case 'number':
        inputs[input.id] = input.valueAsNumber
        input.onchange = onSliderChange
        break
      case 'range':
        inputs[input.id] = input.valueAsNumber
        input.onmouseup = onSliderChange
        input.ontouchend = onSliderChange
        break
      case 'checkbox':
        inputs[input.id] = input.checked
        input.onclick = onSliderChange
        break
      default:
        break
    }
  }
  return inputs
}

// more globals
let scene, camera, renderer, controls

/**
 * Sets up the scene, camera, renderer, lights and controls and starts the animation
 */
function init() {

    // Rhino models are z-up, so set this as the default
    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

    // create a scene and a camera
    scene = new THREE.Scene()
    scene.background = new THREE.Color(1, 1, 1)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(1, -1, 1) // like perspective view

    // very light grey for background, like rhino
    scene.background = new THREE.Color('whitesmoke')

    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // add some controls to orbit the camera
    controls = new OrbitControls(camera, renderer.domElement)

    // add a directional light
    const directionalLight = new THREE.DirectionalLight( 0xffffff )
    directionalLight.intensity = 2
    scene.add( directionalLight )

    const ambientLight = new THREE.AmbientLight()
    scene.add( ambientLight )

    // handle changes in the window size
    window.addEventListener( 'resize', onWindowResize, false )

    animate()
}

/**
 * Call appserver
 */
async function compute() {
  // construct url for GET /solve/definition.gh?name=value(&...)
  const url = new URL('/solve/' + data.definition, window.location.origin)
  Object.keys(data.inputs).forEach(key => url.searchParams.append(key, data.inputs[key]))
  console.log(url.toString())
  
  const data = {
    definition: definition,
    inputs: {
      'u1': u1_slider.valueAsNumber,
      'v1': v1_slider.valueAsNumber,
      'x2': x2_slider.valueAsNumber,
      'y2': y2_slider.valueAsNumber,
      'x3': x3_slider.valueAsNumber,
      'y3': y3_slider.valueAsNumber,
      'z4': z4_slider.valueAsNumber,
      'points': points
    },
  };

  try {
    const response = await fetch(url)
  
    if(!response.ok) {
      // TODO: check for errors in response json
      throw new Error(response.statusText)
    }

    const responseJson = await response.json()

    collectResults(responseJson)

  } catch(error) {
    console.error(error)
  }
}

/**
 * Parse response
 */
function collectResults(responseJson) {

    const values = responseJson.values

    // clear doc
    if( doc !== undefined)
        doc.delete()

    //console.log(values)
    doc = new rhino.File3dm()

    // for each output (RH_OUT:*)...
    for ( let i = 0; i < values.length; i ++ ) {
      // ...iterate through data tree structure...
      for (const path in values[i].InnerTree) {
        const branch = values[i].InnerTree[path]
        // ...and for each branch...
        for( let j = 0; j < branch.length; j ++) {
          // ...load rhino geometry into doc
          const rhinoObject = decodeItem(branch[j])
          if (rhinoObject !== null) {
            doc.objects().add(rhinoObject, null)
          }
        }
      }
    }

    if (doc.objects().count < 1) {
      console.error('No rhino objects to load!')
      showSpinner(false)
      return
    }

    // load rhino doc into three.js scene
    const buffer = new Uint8Array(doc.toByteArray()).buffer
    loader.parse( buffer, function ( object ) 
    {
        // debug 
        /*
        object.traverse(child => {
          if (child.material !== undefined)
            child.material = new THREE.MeshNormalMaterial()
        }, false)
        */

        // clear objects from scene. do this here to avoid blink
        scene.traverse(child => {
            if (!child.isLight) {
                scene.remove(child)
            }
        })

        // add object graph from rhino model to three.js scene
        scene.add( object )

        // hide spinner and enable download button
        showSpinner(false)
        downloadButton.disabled = false

        // zoom to extents
        zoomCameraToSelection(camera, controls, scene.children)
    })
}

/**
 * Attempt to decode data tree item to rhino geometry
 */
function decodeItem(item) {
  const data = JSON.parse(item.data)
  if (item.type === 'System.String') {
    // hack for draco meshes
    try {
        return rhino.DracoCompression.decompressBase64String(data)
    } catch {} // ignore errors (maybe the string was just a string...)
  } else if (typeof data === 'object') {
    return rhino.CommonObject.decode(data)
  }
  return null
}

/**
 * Called when a slider value changes in the UI. Collect all of the
 * slider values and call compute to solve for a new scene
 */
function onSliderChange () {
  showSpinner(true)
  // get slider values
  let inputs = {}
  for (const input of document.getElementsByTagName('input')) {
    switch (input.type) {
    case 'number':
      inputs[input.id] = input.valueAsNumber
      break
    case 'range':
      inputs[input.id] = input.valueAsNumber
      break
    case 'checkbox':
      inputs[input.id] = input.checked
      break
    }
  }
  
  data.inputs = inputs

  compute()
}

/**
 * The animation loop!
 */
function animate() {
  requestAnimationFrame( animate )
  controls.update()
  renderer.render(scene, camera)
}

/**
 * Helper function for window resizes (resets the camera pov and renderer size)
  */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
  animate()
}

/**
 * Helper function that behaves like rhino's "zoom to selection", but for three.js!
 */
function zoomCameraToSelection( camera, controls, selection, fitOffset = 1.2 ) {
  
  const box = new THREE.Box3();
  
  for( const object of selection ) {
    if (object.isLight) continue
    box.expandByObject( object );
  }
  
  const size = box.getSize( new THREE.Vector3() );
  const center = box.getCenter( new THREE.Vector3() );
  
  const maxSize = Math.max( size.x, size.y, size.z );
  const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );
  
  const direction = controls.target.clone()
    .sub( camera.position )
    .normalize()
    .multiplyScalar( distance );
  controls.maxDistance = distance * 10;
  controls.target.copy( center );
  
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  camera.position.copy( controls.target ).sub(direction);
  
  controls.update();
  
}

/**
 * This function is called when the download button is clicked
 */
function download () {
    // write rhino doc to "blob"
    const bytes = doc.toByteArray()
    const blob = new Blob([bytes], {type: "application/octect-stream"})

    // use "hidden link" trick to get the browser to download the blob
    const filename = data.definition.replace(/\.gh$/, '') + '.3dm'
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()
}

/**
 * Shows or hides the loading spinner
 */
function showSpinner(enable) {
  if (enable)
    document.getElementById('loader').style.display = 'block'
  else
    document.getElementById('loader').style.display = 'none'
}