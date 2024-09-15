import {
    Post,
    Renderer,
    Camera,
    Transform,
    Program,
    GLTFLoader,
    Vec2,
    Vec4,
    RendererSortable,
    Vec3,
} from "ogl";

import { autoResize } from "./canvas"

import solid_frag from "../../shaders/solid.frag";
import vertex from "../../shaders/vertex.glsl";
import outline_frag from "../../shaders/outline.frag";
import outlineVert from "../../shaders/outline.vert";
import glitchEffect from "../../shaders/glitch.frag";
import aberrationEffect from "../../shaders/aberration.frag";
import postVert from "../../shaders/post.vert";
import { MouseTracker } from "./mouse";


const renderer = new Renderer({
    antialias: true,
    alpha: true,
    dpr: window.devicePixelRatio,
    autoClear: true,
});

const gl = renderer.gl;
const el = document.getElementById("3D");
el?.appendChild(gl.canvas);
gl.clearColor(1.0, 1.0, 1.0, 0.0);
// gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);

const post = new Post(gl);

const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new Vec2(gl.canvas.width, gl.canvas.height) },
};

const camera = new Camera(gl);
camera.position.set(0, 0, 2.5);

const tracker = new MouseTracker();

autoResize(el!, renderer, (width: number, height: number) => {
    const aspect = width / height;
    const zoom = (window.innerWidth <= 640) ? 1.8 : 2.2;

    camera.orthographic({
        zoom,
        left: -1 * aspect,
        right: 1 * aspect,
        bottom: -1,
        top: 1,
        near: 0.01,
        far: 1000,
    });

    post.resize();
    uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height);
});


const scene = new Transform();

const solid = (color: Vec4) =>
    new Program(gl, {
        vertex: vertex,
        fragment: solid_frag,
        uniforms: {
            uColor: { value: color },
        },
        transparent: true,
        cullFace: false,
    });

const outlineProgram = (color: Vec3) =>
    new Program(gl, {
        vertex: outlineVert,
        fragment: outline_frag,
        uniforms: {
            uTime: uniforms.uTime,
            uResolution: uniforms.uResolution,
            uColor: { value: color },
        },
        transparent: true,
        cullFace: false,
    });

const faceTransparency = 0.7;
const purpleColor = new Vec4(87.0 / 255.0, 6.0 / 255.0, 140.0 / 255.0, faceTransparency);
const tealColor = new Vec4(0.0 / 255.0, 155.0 / 255.0, 138.0 / 255.0, faceTransparency);

let sides: any;
let faces: any;

async function loadInitial() {
    const modelPath = "/themes/CSAW-CTFd-Themes/static/img/osiris-logo.glb";
    const gltf = await GLTFLoader.load(gl, modelPath);
    // console.log(gltf);

    sides = gltf.scene.find((s: any) => s.name === "Sides");
    faces = gltf.scene.find((s: any) => s.name === "Faces");

    // TODO: abstract these two functions into one common function
    const setFacesProgram = (searchString: string, color: Vec4) => {
        const meshes: Transform[] = faces.children.find((s: { name: string; }) => s.name === searchString).children.reduce((acc: any[], cur) => acc.concat(cur.children), []);

        meshes.forEach(
            m => (m.children[0] as RendererSortable).program = solid(color)
        );
    }

    setFacesProgram("Top", purpleColor);
    setFacesProgram("Bottom", tealColor);

    const setSidesProgram = (searchString: string, color: Vec4) => {
        const meshes: Transform[] = sides.children.find((s: { name: string; }) => s.name === searchString).children;

        meshes.forEach(
            m => (m.children[0] as RendererSortable).program = outlineProgram(new Vec3(color.x, color.y, color.z))
        );
    }

    setSidesProgram("SidesTop", purpleColor);
    setSidesProgram("SidesBottom", tealColor);

    sides.setParent(scene);
    faces.setParent(scene);

    requestAnimationFrame(update);
}

loadInitial();

const aberrationPass = post.addPass({
    vertex: postVert,
    fragment: aberrationEffect,
    uniforms: uniforms,
    enabled: true,
});

const glitchPass = post.addPass({
    vertex: postVert,
    fragment: glitchEffect,
    uniforms: uniforms,
    enabled: true,
});

function update(time: number) {
    requestAnimationFrame(update);
    uniforms.uTime.value = time * 0.001;

    // For some reason this doesn't work when setting the Euler object directly
    const rot = tracker.getRotation();
    scene.rotation.x = rot.x;
    scene.rotation.y = rot.y;

    post.render({ scene, camera, sort: false });
}