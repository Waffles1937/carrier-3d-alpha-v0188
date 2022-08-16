/*************************************************
Carrier!

Release notes


// Enable the following code to analyze memory usage. Output
// is printed to the JavaScript console. This is inefficient,
// remember to disable it before sharing it.
/*
game.onUpdateInterval(5000, function () {
    control.heapSnapshot()
    console.log("FIXME, heap snapshot active, disable this before sharing")
})
*/

// When making incompatible changes to the saved settings, call this one time
// to reset the stored configuration.
settings.clear()

class ChessboardModel extends MeshModelBase {
    constructor() {
        super()

        this.isTwoSided = true

    let nsquares = 0
        for (let yi = -12; yi <= 12; ++yi) {
            for (let xi = -12; xi <= 12; ++xi) {
                if (!(xi==0 && yi==0) && Math.percentChance(80)) continue
                const x = xi * 2 + yi
                const y = yi * 2 - xi
                //const x = Math.floor(60 * Math.random() - 30)
                //const y = Math.floor(60 * Math.random() - 30)

                this.vertices.push([(x) * 12 * FP_ONE,
                                    0,
                                    -(y) * 12 * FP_ONE])
                this.vertices.push([(x + 1) * 12 * FP_ONE,
                                    0,
                                    -(y) * 12 * FP_ONE])
                this.vertices.push([(x + 1) * 12 * FP_ONE,
                                    0,
                                    -(y + 1) * 12 * FP_ONE])
                this.vertices.push([(x) * 12 * FP_ONE,
                                    0,
                                    -(y + 1) * 12 * FP_ONE])
                ++nsquares
            }
        }

        for (let i = 0; i < nsquares; ++i) {
            const p = i * 4
            this.faces.push([p, p+1, p+2, p+3])
        }

        //this.boundingSphereRadius = Math.floor(Math.sqrt(8*8 + 8*8) * FP_ONE)
        this.calculateBoundingSphere()
        //console.log("r=" + this.boundingSphereRadius)
        this.calculateNormalVectorsFromFaces()
    }
}

class BoardInstance extends InstanceBase {
    constructor() {
        super()
    }
    updateWorldFromModel(multiplier: Fx8, shipMove: Fx8[], isSetupScreen: boolean) {
        this.worldFromModel[9] -= Fx8_to_FP(shipMove[0])
        this.worldFromModel[10] -= Fx8_to_FP(shipMove[1])
        this.worldFromModel[11] -= Fx8_to_FP(shipMove[2])
    }
}

class CarrierModel extends MeshTreeModelBase {
    static verticesFloat: number[][] = [
        // landing strip
        [-0.8, 1.5, -4], // 0
        [-2.3, 1.5, -3.76],
        [-0.7, 1.5, 6.24],
        [0.8, 1.5, 6],

        // deck
        [-2.3, 1.5, 4],
        [-1.5, 1.5, 5.5], // 5
        [2.3, 1.5, 4],
        [2.3, 1.5, -3],
        [0.8, 1.5, -4],
        [0.5, 1.5, -7],
        [-0.5, 1.5, -7], // 10
    
        // Lower corners of deck
        [-0.8, 1.4, -4], // 11, under 0
        [-2.3, 1.4, -3.76],
        [-0.7, 1.4, 6.24],
        [0.8, 1.4, 6],
        [-2.3, 1.4, 4],
        [-1.5, 1.4, 5.5], // 16, under 5
        [2.3, 1.4, 4],
        [2.3, 1.4, -3],
        [0.8, 1.4, -4],
        [0.5, 1.4, -7],
        [-0.5, 1.4, -7], // 21, under 10
    
        // Tower
        [1.2, 1.5, 1.2], // 22
        [1.2, 1.5, 2.8],
        [1.8, 1.5, 2.8],
        [1.8, 1.5, 1.2],
        [1.2, 2, 1.2], // 26
        [1.2, 2, 2.8],
        [1.8, 2, 2.8],
        [1.8, 2, 1.2],
        [1, 2.7, 1], // 30
        [1, 2.7, 3],
        [2, 2.5, 3],
        [2, 2.5, 1], // 33

        // Bottom
        [-0.8, 1.4, 6], // 34
        [-0.5, 0, 5], // 35
        [0.5, 0, 5],
        [0.5, 0, -4],
        [0, 0, -5],
        [-0.5, 0, -4], // 39
    ]

    // Triangle vertices for each face, in counterclockwise order 
    // when viewed from the outside.
    static deckSplitFace = [0, 1, 4, 5, 2, 3, 6, 7, 8]
    static deckFaces = [
        // nose
        [8, 9, 10, 0],
        // landing strip
        [-6*4, 0, 1, 2, 3],
    ]
    static deckSideFaces = [
        [0, 11, 12, 1],
        [1, 12, 15, 4],
        [4, 15, 16, 5],
        [5, 16, 13, 2],
        [2, 13, 14, 3],
        [3, 14, 17, 6],
        [6, 17, 18, 7],
        [7, 18, 19, 8],
        [8, 19, 20, 9],
        [9, 20, 21, 10],
        [10, 21, 11, 0],
    ]
    static towerSplitFace = [26, 27, 28, 29]
    static towerBottomFaces = [
        [22, 23, 27, 26],
        [23, 24, 28, 27],
        [24, 25, 29, 28],
        [25, 22, 26, 29],
    ]
    static towerTopFaces = [
        [26, 27, 31, 30],
        [27, 28, 32, 31],
        [28, 29, 33, 32],
        [29, 26, 30, 33],
        [30, 31, 32, 33],
    ]
    static hullSplitFace = [19, 18, 17, 14, 13, 16, 15, 12, 11] // reverse layer below deckSplitFace (vertex# +11)
    static hullNoseFaces = [
        [11, 21, 20, 19], // reverse nose (vertex# +11)
    ]
    static hullFaces = [
        [36, 14, 34, 35], // back
        [14, 36, 37, 19], // right
        [11, 39, 35, 34], // left
        [37, 38, 20],
        [20, 19, 37],
        [21, 20, 38],
        [11, 21, 39],
        [38, 39, 21],
    ]

    constructor() {
        super()

        const verticesFloat = CarrierModel.verticesFloat

        const scale = 1
        // Convert vertices to fixed point
        const vertices = this.vertices
        for (let i = 0; i < verticesFloat.length; ++i) {
            let vert = verticesFloat[i]
            vertices.push([Math.floor(vert[0] * scale * FP_ONE),
                           Math.floor(vert[1] * scale * FP_ONE),
                           Math.floor(vert[2] * scale * FP_ONE)])
        }

        //this.faces.push(CarrierModel.deckFaces[0])

        let towerTop = new MeshTreeNode(this,
            null, CarrierModel.towerTopFaces)
        let towerBottom = new MeshTreeNode(this,
            CarrierModel.towerSplitFace, CarrierModel.towerBottomFaces)
        towerBottom.addOutside(towerTop)

        let deck = new MeshTreeNode(this, null, CarrierModel.deckFaces)

        let body = new MeshTreeNode(this, 
            CarrierModel.deckSplitFace, 
            CarrierModel.deckSideFaces)
        body.addOutside(deck)
        body.addOutside(towerBottom)

        let hull = new MeshTreeNode(this,
            CarrierModel.hullSplitFace, CarrierModel.hullNoseFaces)
        body.addInside(hull)
        hull.addOutside(new MeshTreeNode(this, null, CarrierModel.hullFaces))

        this.meshTree = body

        this.calculateBoundingSphere()
        this.calculateNormalVectorsFromFaces()
    }
}

class CarrierInstance extends InstanceBase {
    constructor() {
        super()
    }
    updateWorldFromModel(multiplier: Fx8, shipMove: Fx8[], isSetupScreen: boolean) {
        this.worldFromModel[9] -= Fx8_to_FP(shipMove[0])
        this.worldFromModel[10] -= Fx8_to_FP(shipMove[1])
        this.worldFromModel[11] -= Fx8_to_FP(shipMove[2])
    }
}

let boardModel = new ChessboardModel()
//let boardInstance : BoardInstance = null 
let seaInstance = new BoardInstance()
let cloudInstance = new BoardInstance()
cloudInstance.worldFromModel[10] = 70 << FP_BITS
let cloud2Instance = new BoardInstance()
cloudInstance.worldFromModel[0] = -1 << FP_BITS
cloud2Instance.worldFromModel[10] = 143 << FP_BITS
/*
let boardModel : ChessboardModel = null
let seaInstance : BoardInstance = null
let cloudInstance : BoardInstance = null
let cloud2Instance : BoardInstance = null
*/

let carrierModel = new CarrierModel()
let carrierInstance = new CarrierInstance()
//carrierInstance.worldFromModel[9] = 0 << FP_BITS
//carrierInstance.worldFromModel[10] = -6 << FP_BITS
//carrierInstance.worldFromModel[11] = -22 << FP_BITS
/*
let carrierModel : CarrierModel = null
let carrierInstance : CarrierInstance = null
*/

const perfRotate = simpleperf.getCounter("rotateModel")

/*
class ShipInstance extends InstanceBase {
    initialRotation: number[]
    velocity: Fx8[]
    worldSize: number
    orientation: Fx8[]

    tmpRotation: number[]

    constructor(wave: number, instance: number, worldSize: number) {
        super()

        // Save the world size for movement updates. If it changes, asteroids
        // need to be regenerated.
        this.worldSize = worldSize

        // Set up a random initial rotation axis
        this.initialRotation = []
        mat_setIdentity_FP(this.initialRotation)

        this.tmpRotation = []
        mat_setIdentity_FP(this.tmpRotation)

        // Initial velocity and angular velocity
        this.velocity = [Fx.zeroFx8, Fx.zeroFx8, Fx.zeroFx8]

        this.orientation = []
        quat.setIdentity(this.orientation)
    }

    updateWorldFromModel(multiplier: Fx8, shipMove: Fx8[], isSetupScreen: boolean) {
        perfRotate.start()
        const viewerInModel: number[] = []
        vec_applyInverseTransformToOriginFP(viewerInModel, this.viewerFromModel)

        let pitch = Fx.zeroFx8
        let roll = Fx.zeroFx8
        // try to place the target (viewer) on the -z axis in model space
        const vx = viewerInModel[0]
        const vy = viewerInModel[1]
        const vz = viewerInModel[2]
        if (vz < 0) {
            // pitch only
            pitch = ((vy > 0 ? -2 : 2) as any as Fx8)
        } else {
            if (vx > 16) roll = (-2 as any as Fx8)
            if (vx < -16) roll = (2 as any as Fx8)
            if (vy > 4) pitch = (-2 as any as Fx8)
            if (vy < -4) pitch = (2 as any as Fx8)
        }
        //console.log("viewer at [" + viewerInModel.join(", ") + "] roll=" + roll + " pitch=" + pitch)

        quat.rotateZ(this.orientation, roll)
        quat.rotateX(this.orientation, pitch)
        if (Math.percentChance(2)) quat.normalizeSlowly(this.orientation)
        quat.setMat33(this.worldFromModel as any[] as Fx8[], this.orientation)
        
        const distSq = dot_FP(viewerInModel, viewerInModel)

        perfRotate.end()

        const speed = Fx.toInt(distSq as any as Fx8) > 16 ? Fx8(0.07) : Fx.zeroFx8 // Fx8(0.14)

        this.velocity[0] = Fx.mul(Fx.mul(FP_to_Fx8(this.worldFromModel[6]), speed), multiplier)
        this.velocity[1] = Fx.mul(Fx.mul(FP_to_Fx8(this.worldFromModel[7]), speed), multiplier)
        this.velocity[2] = Fx.mul(Fx.mul(FP_to_Fx8(this.worldFromModel[8]), speed), multiplier)

        // If the game is paused, let asteroids rotate but stop them from moving.
        if (isSetupScreen) return

        // The playing area is a large sphere centered around the player ship.
        // If rocks exit it, make them reappear from the opposite side. The
        // new point isn't guaranteed to be inside the sphere, for example if it
        // is nearly grazing the surface, but that's OK since rocks near the
        // surface are dimmed.

        const oldX = this.worldFromModel[9]
        const oldY = this.worldFromModel[10]
        const oldZ = this.worldFromModel[11]
        this.worldFromModel[9] += Fx8_to_FP(Fx.sub(Fx.mul(this.velocity[0], multiplier), shipMove[0]))
        this.worldFromModel[10] += Fx8_to_FP(Fx.sub(Fx.mul(this.velocity[1], multiplier), shipMove[1]))
        this.worldFromModel[11] += Fx8_to_FP(Fx.sub(Fx.mul(this.velocity[2], multiplier), shipMove[2]))

        const x = this.worldFromModel[9]
        const y = this.worldFromModel[10]
        const z = this.worldFromModel[11]

        const limit = Math.imul(this.worldSize, this.worldSize) << FP_BITS_SQ
        //console.log("limit=" + limit + " worldSize=" + this.worldSize)
        if (Math.imul(x, x) + Math.imul(y, y) + Math.imul(z, z) > limit) {
            this.worldFromModel[9] = -oldX
            this.worldFromModel[10] = -oldY
            this.worldFromModel[11] = -oldZ
        }
    }
}
*/

class AsteroidInstance extends InstanceBase {
    initialRotation: number[]
    velocity: Fx8[]
    angle: Fx8
    angularVelocity: Fx8
    worldSize: number

    constructor(wave: number, instance: number, worldSize: number) {
        super()

        // Save the world size for movement updates. If it changes, asteroids
        // need to be regenerated.
        this.worldSize = worldSize

        // Set up a random initial rotation axis
        this.initialRotation = []
        mat_setIdentity_FP(this.initialRotation)
        rotateX_mat33_FP(this.initialRotation, Fx8(Math.random() * 2))
        rotateY_mat33_FP(this.initialRotation, Fx8(Math.random() * 2))
        rotateZ_mat33_FP(this.initialRotation, Fx8(Math.random() * 2))

        // Initial velocity and angular velocity
        this.velocity = [Fx.zeroFx8, Fx.zeroFx8, Fx.zeroFx8]
        if (wave > 0) {
            const alpha = Math.random() * Math.PI * 2
            const beta = Math.acos(Math.random() * 2 - 1)
            const speed = Math.random() * wave + 0.3
            this.velocity[0] = Fx8(Math.cos(alpha) * Math.cos(beta) * speed / 20)
            this.velocity[1] = Fx8(Math.sin(alpha) * Math.cos(beta) * speed / 20)
            this.velocity[2] = Fx8(Math.sin(beta) * speed / 20)
        }

        this.angle = Fx.zeroFx8
        this.angularVelocity = Fx8((Math.random() + 0.1) * 2 / 100)

        if (wave > 0) {
            // Randomly place new asteroids, but not too close to the player or to the edge.
            const distRange = worldSize * FP_ONE
            const randSign = () => Math.random() > 0.5 ? 1 : -1
            const minDistanceSquared = 100 << FP_BITS_SQ
            const maxDistanceSquared = Math.imul(worldSize, worldSize) << FP_BITS_SQ
            while (true) {
                const x = Math.floor(randSign() * (Math.random() * distRange))
                const y = Math.floor(randSign() * (Math.random() * distRange))
                const z = Math.floor(randSign() * (Math.random() * distRange))
                const r = Math.imul(x, x) + Math.imul(y, y) + Math.imul(z, z)
                if (x * x + y * y + z * z < minDistanceSquared) continue
                if (x * x + y * y + z * z >= maxDistanceSquared) continue
                this.worldFromModel[9] = x
                this.worldFromModel[10] = y
                this.worldFromModel[11] = z
                break
            }
        } else {
            // First wave has non-moving asteroids at fixed positions.
            const offset = (instance + (instance & 1 ? 0.5 : 0)) * Math.PI * 2 / 3
            this.worldFromModel[9] = Math.floor((Math.cos(offset) * 10) * FP_ONE)
            this.worldFromModel[10] = 0 * Math.floor(((instance & 1 ? 5 : -5)) * FP_ONE)
            this.worldFromModel[11] = Math.floor((Math.sin(offset) * 10 - 17) * FP_ONE)

            this.worldFromModel[10] = 15 * FP_ONE

            /*
            if (instance == 0) {
                this.worldFromModel[9] = 0
                this.worldFromModel[10] = 0
                this.worldFromModel[11] = -6 * FP_ONE
            }
            */
        }
    }
    
    updateWorldFromModel(multiplier: Fx8, shipMove: Fx8[], isSetupScreen: boolean) {
        perfRotate.start()
        this.angle = Fx.add(this.angle, Fx.mul(this.angularVelocity, multiplier))
        mul_mat33_rotateX_partial_FP(this.worldFromModel, this.initialRotation, this.angle)
        perfRotate.end()

        // If the game is paused, let asteroids rotate but stop them from moving.
        if (isSetupScreen) return

        // The playing area is a large sphere centered around the player ship.
        // If rocks exit it, make them reappear from the opposite side. The
        // new point isn't guaranteed to be inside the sphere, for example if it
        // is nearly grazing the surface, but that's OK since rocks near the
        // surface are dimmed.

        const oldX = this.worldFromModel[9]
        const oldY = this.worldFromModel[10]
        const oldZ = this.worldFromModel[11]
        this.worldFromModel[9] += Fx8_to_FP(Fx.sub(Fx.mul(this.velocity[0], multiplier), shipMove[0]))
        this.worldFromModel[10] += Fx8_to_FP(Fx.sub(Fx.mul(this.velocity[1], multiplier), shipMove[1]))
        this.worldFromModel[11] += Fx8_to_FP(Fx.sub(Fx.mul(this.velocity[2], multiplier), shipMove[2]))
        const x = this.worldFromModel[9]
        const y = this.worldFromModel[10]
        const z = this.worldFromModel[11]

        const limit = Math.imul(this.worldSize, this.worldSize) << FP_BITS_SQ
        if (Math.imul(x, x) + Math.imul(y, y) + Math.imul(z, z) > limit) {
            this.worldFromModel[9] = -oldX
            this.worldFromModel[10] = -oldY
            this.worldFromModel[11] = -oldZ
        }
    }
}

// The "Spray" particle effect doesn't have a configurable color,
// resulting in near-invisible particles. This is a copy with a modified
// color value. Source:
// https://github.com/microsoft/pxt-common-packages/blob/master/libs/game/particlefactories.ts#L94
class ExplodeFactory extends particles.SprayFactory {
    galois: Math.FastRandom

    constructor(speed: number, centerDegrees: number, arcDegrees: number) {
        super(speed, centerDegrees, arcDegrees)
        this.galois = new Math.FastRandom();
    }
    createParticle(anchor: particles.ParticleAnchor) {
        const p = super.createParticle(anchor)
        p.color = this.galois.percentChance(50) ? 11 : 14
        if (true) { // this.galois.percentChance(50)) {
            p.vx = Fx.rightShift(Fx.imul(p.vx, this.galois.randomRange(16, 255)), 8)
            p.vy = Fx.rightShift(Fx.imul(p.vy, this.galois.randomRange(16, 255)), 8)
        }
        /*
        if (this.galois.percentChance(10)) {
            p.vx = Fx.rightShift(p.vx, 1)
            p.vy = Fx.rightShift(p.vy, 1)
        }
        */
        return p
    }
    drawParticle(particle: particles.Particle, x: Fx8, y: Fx8) {
        screen.setPixel(Fx.toInt(x), Fx.toInt(y), particle.color);
    }
}
const particleExplode = new effects.ParticleEffect(400, 100, function (anchor: particles.ParticleAnchor, particlesPerSecond: number) {
    const factory = new ExplodeFactory(200, 0, 359)
    const src = new particles.ParticleSource(anchor, particlesPerSecond, factory);
    src.setAcceleration(0, 0);
    return src;
});

let isSetupScreen = true
let showFps = false
let useCockpit = true

// Layers of the overall scene, drawn in ascending z-layer order
const zLayer3D = 1
const zLayerLaser = 2
const zLayerCockpit = 3
const zLayerReticle = 4
const zLayerSetup = 6
const zLayerDebug = 200

let overlaySprite: Sprite

let throttleSprite = sprites.create(assets.image`Throttle`)
throttleSprite.z = zLayerReticle
throttleSprite.setPosition(52-5, 100-3)

// Configure the 3D renderer.
let renderer = new Renderer3d()
renderer.useFlatShading = false
renderer.setPalette8Gray8Color()
renderer.setLightAngles(45, 30)

// Set the horizontal field of view for 3D rendering.
const horizontalFovDegrees: number = 90
let camera = new Camera3d(horizontalFovDegrees)

let lastTick = 0
let nextStatsTimestamp = 0
const baseSpeed = 0.05
const boostSpeed = baseSpeed * 2 // added to baseSpeed while boosting
const boostSustainFrames = 100
const boostReleaseFrames = 100
const maxThrottle = 10
const minThrottle = 1
let throttleSetting = 5
let boostActive = 0
let controlMode = 0 
let stickRoll = true
let accelerometerRoll = false
let accelerometerPitch = false
let accelerometerYaw = false
let controlInvertY = true
let controlAnalogStick = true

// Start out with the laser set to having just been fired, this avoids
// a stray shot when starting the game with the A button.
let firing = 0
let laserPowerPerShot = 20
let laserPowerMax = 256
let laserPower = laserPowerMax
let laserGaugeWidthMax = 94
let laserGaugeMultiplierFP = Math.ceil(laserGaugeWidthMax * FP_ONE / laserPowerMax)
let laserOverheatingPlayed = false

let waveNum = 0
let nextWaveNum = 0
let nextWaveCountdown = 0

// Size in each axis direction of the observable universe.
const worldSizes = [40, 50, 100, 30]
const worldSizeDescriptions = ["medium", "large", "huge", "small"]
let worldSize = worldSizes[0]

const starCounts = [100, 200, 400, 800, 50]
let starCount = starCounts[0]

let icoModel = new IcosahedronModel()
let asteroids: AsteroidInstance[] = []

let collisionsEnabled = true
//let buttonMoveOnly = true
let buttonMoveOnly = false

let needsWaveReset = false
const preGameSetup = function() {
    if (needsWaveReset) {
        asteroids = []
        waveNum = nextWaveNum
        nextWaveNum = 0
        needsWaveReset = false
    }
}

const spawnAsteroids = function() {
    asteroids = []
    let icoCount = 6 + waveNum * 2
    // Don't exceed the 256-priority-level limit, leaving some spares.
    if (icoCount > 250) icoCount = 250
    for (let i = 0; i < icoCount; ++i) {
        asteroids.push(new AsteroidInstance(waveNum, i, worldSize))
    }
}

// Rotation control sensitivity, degrees per target frame.
// This is scaled below based on framerate.
const rotAngleDegPerFrame = 2
let yawRate = 1
let rollRate = 1
let pitchRate = 1

let soundZap = new music.Melody("~16 @10,490,0,0 !1600,500^1")
let soundOverheated = new music.Melody("~16 @10,490,0,0 !800,500^700")
let soundBoom = new music.Melody("~4 @10,990,0,1 !400,1")
let soundExploded = new music.Melody("~4 @10,1990,0,1 !300,1")
let soundNextWave = new music.Melody("~16 R:4-100 E3 F E F E F")
let soundBoost = new music.Melody("~18 @25,25,200," + boostReleaseFrames * 20 + " !200," + boostSustainFrames * 20)

const cleanUpResources = function() {
    renderer.freeResources()

    // Destroy the asteroid instances and other large objects. Careful,
    // objects used in scene.createRenderable()-registered functions
    // must remain valid. (Zero asteroids is OK, asteroids=null would not be.)
    asteroids = []
    if (overlaySprite) overlaySprite.destroy()
    overlaySprite = null
    control.gc()
}

info.setLife(1)
info.onLifeZero(function() {
    cleanUpResources()
    pause(250)
    // TODO: see if a scene change can avoid error 021 (too many objects) on meowbit?
    //game.pushScene()
    game.over(false)
    //game.popScene()
})

// Matrices are 3 rows x 4 columns, following OpenGL conventions but 
// omitting the fourth row which is always (0, 0, 0, 1).
// 
//    m0 m3 m6 m9
//    m1 m4 m7 m10
//    m2 m5 m8 m11
//
// This is stored as a plain array in column-major order:
//   [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11] 
//
// Geometrically, this combines a rotation and position. 
// Space B's origin in space A coordinates is at (ax, ay, az).
// Space B's X axis is in direction (ux, uy, uz) in space A coordinates.
// Space B's Y axis is in direction (vx, vy, vz) in space A coordinates.
// Space B's Z axis is in direction (wx, wy, wz) in space A coordinates.
//
// This matrix product transforms a point in space B coordinates (bx, by, bz)
// to space A coordinates (ax, ay, az):
//
//    ux vx wx px  *  bx  =  ax  = ux*bx + vx*by + wx*bz + ax
//    uy vy wy py     by     ay    uy*bx + vy*by + wy*bz + ay
//    uz vz wz pz     bz     az    uz*bx + vz*by + wz*bz + az
//                     1      1    1

const viewerPoseStart: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 6, 22]
const viewerPose: number[] = viewerPoseStart.map((x) => x)
const shipFrameMovement: number[] = [0, 0, 0]
const shipFrameMovementFx8: Fx8[] = [Fx.zeroFx8, Fx.zeroFx8, Fx.zeroFx8]

// Apply a rotation to the viewer pose matrix using the specified columns.
const rotateColumns = function(angle: number, a: number, b: number) {
        let s = Math.sin(angle)
        let c = Math.cos(angle)
        let ox = viewerPose[a]
        let oy = viewerPose[a + 1]
        let oz = viewerPose[a + 2]
        viewerPose[a] = viewerPose[a] * c + viewerPose[b] * s
        viewerPose[a + 1] = viewerPose[a + 1] * c + viewerPose[b + 1] * s
        viewerPose[a + 2] = viewerPose[a + 2] * c + viewerPose[b + 2] * s
        viewerPose[b] = -ox * s + viewerPose[b] * c
        viewerPose[b + 1] = -oy * s + viewerPose[b + 1] * c
        viewerPose[b + 2] = -oz * s + viewerPose[b + 2] * c
}
const rotateX = function(angle: number) {
    rotateColumns(angle, 3, 6)
}
const rotateY = function(angle: number) {
    rotateColumns(angle, 6, 0)
}
const rotateZ = function(angle: number) {
    rotateColumns(angle, 0, 3)
}

const startNextWaveIfAllDestroyed = function() {
    if (!nextWaveCountdown && !asteroids.length) {
        // All asteroids just got destroyed.

        // Do a garbage collection now to reduce hiccups during gameplay
        control.gc()
        ++waveNum
        //reticleSprite.say("Wave " + (waveNum + 1), 2500)
        soundNextWave.play(100)
        nextWaveCountdown = 200
    }
}

const shootLaser = function() {
    if (laserPower < laserPowerPerShot) {
        if (!laserOverheatingPlayed) {
            soundOverheated.play(50)
            laserOverheatingPlayed = true
        }
        return
    } else {
        laserOverheatingPlayed = false
    }
    firing = 8
    laserPower -= laserPowerPerShot
    soundZap.play(50)

    // Don't check for hits if there are no targets. This avoids triggering
    // the next wave countdown multiple times.
    let hitTarget = false
    for (let i = asteroids.length - 1; i >= 0; --i) {
        const x = asteroids[i].getX()
        const y = asteroids[i].getY()
        const z = asteroids[i].getZ()
        const d2 = Math.imul(x, x) + Math.imul(y, y) >> FP_ONE
        const r_squared = 4 << FP_BITS_SQ
        if (d2 < r_squared && z < 0) {
            //reticleSprite.startEffect(particleExplode, 100)
            soundBoom.play(100)
            asteroids.splice(i, 1)
            info.player1.changeScoreBy(1)
            hitTarget = true
            break
        }
    }
    if (hitTarget) {
        startNextWaveIfAllDestroyed()
    }

}

const volumes = [64, 128, 255, 0, 8, 16, 32]

const pieceCounts = [4, 8, 16, 32, 0]

// Prefix used for saving settings persistently
const settingPrefix = "spacerocks3d_"

// The menu entries and row count are set up below.
let setupMenu: (number | string | Function)[][] = []
let setupRowCount: number = 0
let setupValues: number[] = []
let setupDisplay: string[] = []
let setupRow = 0

const saveSetupSettings = function() {
    for (let i = 0; i < setupMenu.length; ++i) {
        const settingName = setupMenu[i][1]
        // Skip rows with no key name, including the "start game" setting which must not be persisted.
        if (!settingName) continue
        const value = setupValues[i]
        // No need to save values that are at their default value.
        // Remove legacy default config entries if present.
        let oldValue = settings.readNumber(settingPrefix + settingName)
        if (value == 0) {
            if (oldValue) settings.remove(settingPrefix + settingName)
            continue
        }
        // Don't write a value identical to the currently-stored one.
        if (value == oldValue) continue
        settings.writeNumber(settingPrefix + settingName, setupValues[i])
    }
}

const setupVolume = function(choice: number) {
    music.setVolume(volumes[choice])
    return "Sound volume: " + volumes[choice]
}

const setupShowFPS = function(choice: number) {
    showFps = choice ? true : false
    return "Show FPS: " + (showFps ? "on" : "off")
}

const setupRenderMode = function(choice: number) {
    renderer.useFlatShading = choice ? true : false
    return "Shading mode: " + (renderer.useFlatShading ? "flat" : "dithered")
}

const setupCockpitMode = function(choice: number) {
    // Use true for default choice=0
    useCockpit = choice ? false : true
    
    if (useCockpit) {
        overlaySprite = sprites.create(assets.image`cockpitMin  `)
        // The default position is what we want, so no need to
        // move it. Set the Z order to occlude explosions which
        // are at the reticle sprite's z=1. The radar image is 
        // at z=3 so that it's in front of the cockpit.
        overlaySprite.z = zLayerCockpit
    } else {
        if (overlaySprite) overlaySprite.destroy()
        overlaySprite = null
    }

    return "Cockpit overlay: " + (useCockpit ? "on" : "off")
}

const setupAnalogStick = function(choice: number) {
    // Use true for default choice=0
    controlAnalogStick = choice ? false : true
    return "Analog joystick: " + (controlAnalogStick ? "on" : "off")
}

const setupWorldSize = function(choice: number, loading: boolean=false) {
    worldSize = worldSizes[choice]
    if (!loading) {
        nextWaveNum = waveNum
        needsWaveReset = true
    }
    return "World size: " + worldSizeDescriptions[choice]
}

const setupStartingWave = function(waveChoice: number) {
    // Allow directly changing waves if score is still zero.
    const isNewGame = (info.player1.score() == 0)
    // Internal wave numbers start at zero, add one for screen display
    if (isNewGame) {
        nextWaveNum = waveChoice
        needsWaveReset = true
        return "Start at wave: " + (waveChoice + 1)
    }

    // Not a new game. Allow skipping waves, but not going backwards.
    if (waveChoice > waveNum) {
        nextWaveNum = waveChoice
        needsWaveReset = true
        return "Skip ahead to wave: " + (waveChoice + 1)
    } else {
        return "Start next game at wave: " + (waveChoice + 1)
    }
}

const setupStartGame = function(choice: number, loading: boolean=false) {
    if (!loading) {
        saveSetupSettings()

        isSetupScreen = false

        preGameSetup()

        if (controller.A.isPressed()) {
            // Start out with the laser set to having just been fired, this avoids
            // a stray shot sound when starting the game with the A button.
            let firing = 10
        }
    }
    return "Start Game"
}

const setupResetGame = function(choice: number, loading: boolean=false) {
    if (!loading) {
        saveSetupSettings()
        game.reset()
    }
    return "Reset game"
}

const setupRunBenchmark = function(choice: number, loading: boolean=false) {
    if (!loading) {
        runBenchmark()
    }
    return "Run benchmark"
}

const setupEnableTrace = function(choice: number, loading: boolean=false) {
    if (!loading) {
        if (simpleperf.isEnabled) {
            simpleperf.disableAndShowResults()
        } else {
            simpleperf.enable()
        }
    }
    return simpleperf.isEnabled ? "Show trace results" : "Enable perf tracing"
}

const showSystemMenu = function(choice: number, loading: boolean=false) {
    if (!loading) {
        scene.systemMenu.showSystemMenu()
    }
    return "Open system menu"
}

const setupInvertY = function(choice: number, loading: boolean=false) {
   // Use true for default choice=0    
    controlInvertY = choice ? false : true

    return "Joystick Y: " + (controlInvertY ? "inverted" : "normal")
}

const setupControls = function(controlMode: number) {
    const controls = "Controls: "
    stickRoll = false
    accelerometerYaw = false
    accelerometerRoll = false
    accelerometerPitch = false
    switch (controlMode) {
        case 0:
            yawRate = 1
            rollRate = 1
            pitchRate = 1
            return controls + "Stick yaw/pitch"
        case 1:
            stickRoll = true
            yawRate = 1
            rollRate = 2
            pitchRate = 1.4
            return controls + "Stick roll/pitch"
        case 2:
            accelerometerRoll = true
            yawRate = 0.7
            rollRate = 1.4
            pitchRate = 1.4
            return controls + "Tilt roll"
        case 3:
            accelerometerRoll = true
            accelerometerPitch = true
            yawRate = 0.7
            rollRate = 1.4
            pitchRate = 1.4
            return controls + "Tilt roll/pitch"
        case 4:
            stickRoll = true
            accelerometerYaw = true
            accelerometerPitch = true
            yawRate = 0.7
            rollRate = 1.4
            pitchRate = 1.4
            return controls + "Tilt yaw/pitch"
    }
    return ""
}

// Each menu item has:
// - the number of choices available
// - the name (after settingPrefix) used for saving. Empty string means don't save.
// - the function to be called when a setting is changed. 
//
// Entries with a single choice are intended for actions that take effect immediately when selected.
setupMenu = [
    [1, "", setupStartGame],
    //[20, "startingWave", setupStartingWave],
    [volumes.length, "setupVolume", setupVolume],
    //[worldSizes.length, "worldSize", setupWorldSize],
    //[5, "controlScheme", setupControls],
    [2, "analogStick", setupAnalogStick],
    [2, "invertY", setupInvertY],
    [2, "useCockpit", setupCockpitMode],
    //[starCounts.length, "starCount", setupStarCount],
    //[2, "useDither", setupRenderMode],
    [2, "showFps", setupShowFPS],
    [1, "", setupEnableTrace],
    //[1, "", setupRunBenchmark],
    [1, "", setupResetGame],
    [1, "", showSystemMenu],
]
setupRowCount = setupMenu.length
for (let i = 0; i < setupMenu.length; ++i) {
    let initialValue = 0
    const settingName = setupMenu[i][1]
    if (settingName && settings.exists(settingPrefix + settingName)) {
        initialValue = settings.readNumber(settingPrefix + settingName)   
        //console.log("saved value for " + settingName + " is " + initialValue) 

        // Check for invalid settings and remove them. This includes a setting with
        // value zero, that's the default and doesn't need to be saved.
        if (initialValue <= 0 || initialValue >= setupMenu[i][0] || initialValue != Math.floor(initialValue)) {
            console.log("saved value " + initialValue + " for " + settingName + " invalid, using default") 
            initialValue = 0
            settings.remove(settingPrefix + settingName)
        }
    }
    let setupFunc = setupMenu[i][2] as Function
    let initialDisplay = ""

    // It's possible that the saved setting isn't usable and causes a
    // runtime error. In that case, delete the setting and try again
    // with the default value.
    try {
        initialDisplay = setupFunc(initialValue, true)
        if (!initialDisplay) {
            console.log("Loading setting " + settingName + " rejected, using default")
            initialValue = 0
            initialDisplay = setupFunc(initialValue, true)
        }
    } catch(err) {
        console.log("Loading setting " + settingName + " failed: " + err)
        settings.remove(settingPrefix + settingName)
        initialValue = 0
        initialDisplay = setupFunc(initialValue, true)
    }
    setupValues.push(initialValue)
    setupDisplay.push(initialDisplay)
}

controller.down.onEvent(ControllerButtonEvent.Pressed, function() {
    if (!isSetupScreen) return
    setupRow = (setupRow + 1) % setupRowCount
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function() {
    if (!isSetupScreen) return
    setupRow = (setupRow + setupRowCount - 1) % setupRowCount
})

const setupChangeEntry = function(change: number) {
    if (!isSetupScreen) return

    let menu = setupMenu[setupRow]
    let numValues = menu[0] as number
    let setupFunc = menu[2] as Function
    setupValues[setupRow] = (setupValues[setupRow] + numValues + change) % numValues
    setupDisplay[setupRow] = setupFunc(setupValues[setupRow])

}
const setupNextEntry = function() {
    setupChangeEntry(1)
}
const setupPrevEntry = function() {
    setupChangeEntry(-1)
}
controller.A.onEvent(ControllerButtonEvent.Pressed, setupNextEntry)
controller.right.onEvent(ControllerButtonEvent.Pressed, setupNextEntry)
controller.right.onEvent(ControllerButtonEvent.Repeated, setupNextEntry)
controller.left.onEvent(ControllerButtonEvent.Pressed, setupPrevEntry)
controller.left.onEvent(ControllerButtonEvent.Repeated, setupPrevEntry)

controller.menu.onEvent(ControllerButtonEvent.Pressed, function() {
    if (isSetupScreen) {
        // Treat this as fully equivalent to using the "Start game" function
        setupStartGame(0, false)
    } else {
        setupDisplay[0] = "Continue Game"
        isSetupScreen = true
    }
})

// Set up the initial asteroid state.
spawnAsteroids()

const colTextBright = 9
const colTextDim = 14
const colTextBg = 2
const perfSetupMenu = simpleperf.getCounter("menu")
scene.createRenderable(zLayerSetup, function(img: Image, unused_sceneCamera: scene.Camera) {
    if (!isSetupScreen) return

    perfSetupMenu.start()
    img.printCenter("Carrier 3D [alpha]", 7, 1, image.font8)
    img.printCenter("Carrier 3D [alpha]", 6, 7, image.font8)

    img.printCenter("WSAD keys: pitch/roll", 22, 1)
    img.printCenter("IJKL keys: yaw/throttle", 32, 1)

    let y = 50
    const maxRows = 7
    const firstRow = Math.max(0, setupRow + 1 - maxRows)
    if (firstRow > 0) {
        img.print("↑", 0, y, colTextDim, image.font8)
        img.print("↑", 155, y, colTextDim, image.font8)
    }
    for (let i = 0; i < maxRows; ++i) {
        const row = firstRow + i
        if (row >= setupRowCount) break
        if (row == setupRow) {
            img.fillRect(0, y - 1, 160, 10, 2)
            img.drawRect(0, y - 1, 160, 10, 1)
        }
        img.printCenter(setupDisplay[row], y + 1, colTextBg)
        img.printCenter(setupDisplay[row], y, row == setupRow ? colTextBright : colTextDim)
        y += 10
    }
    if (firstRow + maxRows < setupRowCount) {
        const y2 = y - 10
        img.print("↓", 0, y2, colTextDim, image.font8)
        img.print("↓", 155, y2, colTextDim, image.font8)
    }
    perfSetupMenu.end()
})

const perfLayer3D = simpleperf.getCounter("layer3d")
const perfLayer3DSort = simpleperf.getCounter("layer3dsort")

function drawHorizon() {
    // emitTrapezoid(xstarts: Drawable[][], x0: number, y0a: number, y0b: number,
    //               x1: number, y1a: number, y1b: number, col: number, order: number) {
    //console.log("camera rightTan=" + camera.rightTan + " upTan=" + camera.upTan)

    // The ground plane's normal vector is the Y basis vector of the
    // viewerFromWorld matrix which is the inverse of viewerPose.
    // Since the top left 3x3 part is orthonormal, the inverse is
    // just the transpose. 
    let ux = viewerPose[1]
    let uy = viewerPose[4]
    let uz = viewerPose[7]

    // Frustum half height/width at unit Z distance
    let fh = camera.upTan
    let fw = camera.rightTan

    // The view frustum extends along -z, with +y up and +x right.

    // Get the dot products of view vectors for the screen corner with the
    // ground plane's normal vector. This is >0 for sky, <0 for sea, =0 for horizon.
    let lefttop = -ux * fw + uy * fh - uz
    let leftbottom = -ux * fw - uy * fh - uz
    let righttop = ux * fw + uy * fh - uz
    let rightbottom = ux * fw - uy * fh - uz

    let sky = 15*4
    let ocean = 8*4

    /*
    // Debugging
    Polygon.emitTrapezoid(renderer.xstarts, 0, 99, 119, 21, 99, 119, 7*4, 1)

    Polygon.emitTrapezoid(renderer.xstarts, 0, 0, 20, 20, 0, 20, lefttop > 0 ? 15*4 : 8*4, 2)
    Polygon.emitTrapezoid(renderer.xstarts, 0, 100, 119, 20, 100, 119, leftbottom > 0 ? 15*4 : 8*4, 2)
    Polygon.emitTrapezoid(renderer.xstarts, 140, 0, 20, 159, 0, 20, righttop > 0 ? 15*4 : 8*4, 2)
    Polygon.emitTrapezoid(renderer.xstarts, 140, 100, 119, 159, 100, 119, rightbottom > 0 ? 15*4 : 8*4, 2)
    */
 
    if (lefttop > 0 && leftbottom > 0 && righttop > 0 && rightbottom > 0) {
        // all sky
        Polygon.emitTrapezoid(renderer.xstarts, 0, 0, 119, 159, 0, 119, sky, 0);
    } else if (lefttop < 0 && leftbottom < 0 && righttop < 0 && rightbottom < 0) {
        // all ocean
        Polygon.emitTrapezoid(renderer.xstarts, 0, 0, 119, 159, 0, 119, ocean, 0);
    } else if (lefttop * leftbottom < 0 && righttop * rightbottom < 0) {
        // horizon intersects left and right screen edges
        let hy0 = Math.floor(60 - 60 * (uz + fw * ux) / uy / fh) // left edge, x=0
        let hy1 = Math.floor(60 - 60 * (uz - fw * ux) / uy / fh) // right edge, x=159
        Polygon.emitTrapezoid(renderer.xstarts, 0, 0, hy0, 159, 0, hy1, lefttop > 0 ? sky : ocean, 0)
        Polygon.emitTrapezoid(renderer.xstarts, 0, hy0, 119, 159, hy1, 119, lefttop > 0 ? ocean : sky, 0)
    } else if (lefttop * leftbottom < 0 && lefttop * righttop < 0) {
        // horizon intersects left and top screen edges
        let hy0 = Math.floor(60 - 60 * (uz + fw * ux) / uy / fh) // left edge, x=0
        let hx0 = Math.floor(80 + 80 * (uz - fh * uy) / ux / fw) // top edge, y=0
        Polygon.emitTrapezoid(renderer.xstarts, 0, 0, hy0, hx0, 0, 0, lefttop > 0 ? sky : ocean, 0)
        Polygon.emitTrapezoid(renderer.xstarts, 0, hy0, 119, hx0, 0, 119, lefttop > 0 ? ocean : sky, 0)
        Polygon.emitTrapezoid(renderer.xstarts, hx0, 0, 119, 159, 0, 119, lefttop > 0 ? ocean : sky, 0)
    } else if (lefttop * leftbottom < 0 && leftbottom * rightbottom < 0) {
        // horizon intersects left and bottom screen edges
        let hy0 = Math.floor(60 - 60 * (uz + fw * ux) / uy / fh) // left edge, x=0
        let hx1 = Math.floor(80 + 80 * (uz + fh * uy) / ux / fw) // bottom edge, y=119
        Polygon.emitTrapezoid(renderer.xstarts, 0, 0, hy0, hx1, 0, 119, leftbottom > 0 ? ocean : sky, 0)
        Polygon.emitTrapezoid(renderer.xstarts, 0, hy0, 119, hx1, 119, 119, leftbottom > 0 ? sky : ocean, 0)
        Polygon.emitTrapezoid(renderer.xstarts, hx1, 0, 119, 159, 0, 119, leftbottom > 0 ? ocean : sky, 0)
    } else if (righttop * rightbottom < 0 && lefttop * righttop < 0) {
        // horizon intersects top and right screen edges
        let hx0 = Math.floor(80 + 80 * (uz - fh * uy) / ux / fw) // top edge, y=0
        let hy1 = Math.floor(60 - 60 * (uz - fw * ux) / uy / fh) // right edge, x=159
        Polygon.emitTrapezoid(renderer.xstarts, 0, 0, 119, hx0, 0, 119, righttop > 0 ? ocean : sky, 0)
        Polygon.emitTrapezoid(renderer.xstarts, hx0, 0, 119, 159, hy1, 119, righttop > 0 ? ocean : sky, 0)
        Polygon.emitTrapezoid(renderer.xstarts, hx0, 0, 0, 159, 0, hy1, righttop > 0 ? sky : ocean, 0)
    } else if (righttop * rightbottom < 0 && leftbottom * rightbottom < 0) {
        // horizon intersects bottom and right screen edges
        let hx1 = Math.floor(80 + 80 * (uz + fh * uy) / ux / fw) // bottom edge, y=119
        let hy1 = Math.floor(60 - 60 * (uz - fw * ux) / uy / fh) // right edge, x=159
        Polygon.emitTrapezoid(renderer.xstarts, 0, 0, 119, hx1, 0, 119, rightbottom > 0 ? ocean : sky, 0)
        Polygon.emitTrapezoid(renderer.xstarts, hx1, 0, 119, 159, 0, hy1, rightbottom > 0 ? ocean : sky, 0)
        Polygon.emitTrapezoid(renderer.xstarts, hx1, 119, 119, 159, hy1, 119, rightbottom > 0 ? sky : ocean, 0)
    } else {
        // horizon intersects top and bottom screen edges
        let hx0 = Math.floor(80 + 80 * (uz - fh * uy) / ux / fw) // top edge, y=0
        let hx1 = Math.floor(80 + 80 * (uz + fh * uy) / ux / fw) // bottom edge, y=119
        if (hx0 < hx1) {
            Polygon.emitTrapezoid(renderer.xstarts, 0, 0, 119, hx0, 0, 119, lefttop > 0 ? sky : ocean, 0)
            Polygon.emitTrapezoid(renderer.xstarts, hx0, 0, 119, hx1, 119, 119, lefttop > 0 ? sky : ocean, 0)
            Polygon.emitTrapezoid(renderer.xstarts, hx0, 0, 0, hx1, 0, 119, lefttop > 0 ? ocean : sky, 0)
            Polygon.emitTrapezoid(renderer.xstarts, hx1, 0, 119, 159, 0, 119, lefttop > 0 ? ocean : sky, 0)
        } else {
            Polygon.emitTrapezoid(renderer.xstarts, 0, 0, 119, hx1, 0, 119, lefttop > 0 ? sky : ocean, 0)
            Polygon.emitTrapezoid(renderer.xstarts, hx1, 0, 119, hx0, 0, 0, lefttop > 0 ? sky : ocean, 0)
            Polygon.emitTrapezoid(renderer.xstarts, hx1, 119, 119, hx0, 0, 119, lefttop > 0 ? ocean : sky, 0)
            Polygon.emitTrapezoid(renderer.xstarts, hx0, 0, 119, 159, 0, 119, lefttop > 0 ? ocean : sky, 0)
        }
    }
}

function drawLayer3D(target: Image, unused_sceneCamera: scene.Camera) {
    /*
    const baseShader = shader3d.getHalfAngleDiffuseShader(renderer.lightDirection, 0, 52)
    const shader = shader3d.applyDistanceDimming(baseShader, worldSize << FP_BITS, 8)
    */
    const baseShader = shader3d.getHalfAngleDiffuseShader(renderer.lightDirection, 0, 28)
    const shader = baseShader // shader3d.applyDistanceDimming(baseShader, worldSize << FP_BITS, 0)

    const seaShader = function(normal: number[], z: number, face: number) {
        return 15*4
    }
    const cloudShader = function(normal: number[], z: number, face: number) {
        return 7*4
    }

    if (seaInstance)
        boardModel.drawInstance(renderer, camera, seaShader, seaInstance)
    if (cloudInstance) {
        boardModel.drawInstance(renderer, camera, cloudShader, cloudInstance)
        boardModel.drawInstance(renderer, camera, cloudShader, cloud2Instance)
    }
    if (carrierInstance)
        carrierModel.drawInstance(renderer, camera, baseShader, carrierInstance)

    perfLayer3D.start()
    // Sort the instances by increasing Z in viewer space (+z faces viewer)
    perfLayer3DSort.start()
    asteroids.sort((a, b) => a.getZ() - b.getZ())
    perfLayer3DSort.end()
    for (let i = 0; i < asteroids.length; ++i) {
        // With the objects sorted back to front, add each one's face polygons
        // to the drawing queue for this frame.
        //icoModel.drawInstance(renderer, camera, shader, asteroids[i])
    }

    drawHorizon()

    renderer.drawFrame(target)
    perfLayer3D.end()
}
scene.createRenderable(zLayer3D, drawLayer3D)

scene.createRenderable(zLayerLaser, function(target: Image, sceneCamera: scene.Camera) {
    // Update the cockpit user interface
    let laserGaugeSize = Math.imul(laserPower, laserGaugeMultiplierFP) >> FP_BITS

    // Don't show a filled laser gauge on the setup screen, it's too bright.
    if (isSetupScreen) laserGaugeSize = 0

    if (false && useCockpit) {
        let shakeX = -sceneCamera.drawOffsetX
        let shakeY = -sceneCamera.drawOffsetY

        target.drawRect(33 + shakeX, 82 + shakeY, laserGaugeSize, 2, 10)
        target.drawRect(33 + shakeX + laserGaugeSize, 82 + shakeY, laserGaugeWidthMax - laserGaugeSize, 2, 2)
    } else {
        target.drawRect(0, 120 - laserGaugeSize, 2, laserGaugeSize, 10)
    }    

    throttleSprite.setPosition(48 + (throttleSetting >> 1), 118 - throttleSetting * 2)
    /*
    const throttleGaugeSize = throttleSetting * 4
    if (throttleSetting >= 0) {
        target.drawRect(157, 80 - throttleGaugeSize, 2, throttleGaugeSize, 14)
    } else {
        target.drawRect(157, 80, 2, -throttleGaugeSize, 14)
    }
    */

    // Altimeter
    // FIXME: pick a consistent real-world scale factor
    const altitude = Math.floor(viewerPose[10] * 30)
    const altStr = "" + altitude
    const altRemainder = altitude % 100
    for (let i = -2; i <= 2; ++i) {
        const h = altitude - altRemainder + i * 100
        if (h < 0) continue
        const y = 60 - ((i * 100 - altRemainder) / 10)
        const size = h % 1000 ? 1 : 2
        const color = h == 0 ? 10 : 13
        target.drawRect(100, y, 8, size, color)
    }
    target.print(altStr, 110 - 5 * altStr.length, 86, 13, image.font5)

    // The HUD angle displays are effectively euler angles:
    // - Compass heading: rotation around y
    // - Pitch angle: rotation around x
    // - Roll angle: rotation around z
    // See for example https://www.geometrictools.com/Documentation/EulerAngles.pdf
    // This is the Rz Rx Ry decomposition, using the transpose of the viewerPose
    // matrix as the input matrix.

    // Compass heading, 0..360 degrees
    // FIXME: less expensive way to calculate this?
    const heading = Math.floor(Math.atan2(viewerPose[6], -viewerPose[8]) * 180 / Math.PI) + 180
    target.print("" + heading, 70, 86, 13, image.font5)

    // Pitch and yaw angles
    const rx = Math.round(Math.asin(-viewerPose[7]) * 180 / Math.PI)
    const rz = Math.round(Math.atan2(viewerPose[1], viewerPose[4]) * 180 / Math.PI)
    //target.print("" + rx, 80, 10, 13, image.font5)
    //target.print("" + rz, 80, 16, 13, image.font5)

    //const scale = 60 / (Math.atan(camera.upTan) * 180 / Math.PI) // pixels per degree, FIXME
    const scale = 60 / (camera.upTan * 180 / Math.PI) // pixels per degree, FIXME
    for (let alpha = Math.floor(rx / 10 - 1) * 10; alpha < rx + 20; alpha += 10) {
        const arad = alpha * Math.PI / 180
        const brad = rz * Math.PI / 180
        const c = Math.cos(brad)
        const s = Math.sin(brad)
        const px = (alpha == 0 ? 12 : 9) * scale
        //const py = Math.tan((rx - alpha) * Math.PI / 180) * 180 / Math.PI * scale
        const py = (rx - alpha) * scale
        target.drawLine(80 - px * c - py * s, 60 - px * s + py * c,
                        80 + px * c - py * s, 60 + px * s + py * c, 13)
        target.print("" + alpha, 80 - py * s, 60 + py * c, 13, image.font5)
    }
})

scene.createRenderable(zLayerLaser, function(target: Image, sceneCamera: scene.Camera) {
    if (firing > 3) {
        let shakeX = -sceneCamera.drawOffsetX
        let shakeY = -sceneCamera.drawOffsetY
        // Don't offset the far point of the laser, that isn't affected by screen shake.
        target.drawLine(60 + shakeX, 119 + shakeY, 80, 60, 10)
        target.drawLine(100 + shakeX, 119 + shakeY, 80, 60, 10)
    }
})

let statsFrameCounter = 0
let statsLastFps = 0
scene.createRenderable(zLayerDebug, function(img: Image, unused_sceneCamera: scene.Camera) {
    if (!showFps) return;

    ++statsFrameCounter

    const now = control.millis()
    if (now >= nextStatsTimestamp) {
        statsLastFps = statsFrameCounter
        statsFrameCounter = 0

        nextStatsTimestamp += 1000
        // If we're way behind schedule, advance the time counter
        if (nextStatsTimestamp <= now) nextStatsTimestamp = now + 1000
    }

    img.print("" + statsLastFps, 74, 0, 12)
})

const perfUpdateScene = simpleperf.getCounter("updateScene")

const updateScene = function(multiplierFloat: number, shipFrameMovementFx8: Fx8[]) {
    perfUpdateScene.start()
    renderer.setViewerPose(viewerPose)
    renderer.prepareFrame()

    const multiplier = Fx8(multiplierFloat)
    for (let i = 0; i < asteroids.length; ++i) {
        asteroids[i].updateWorldFromModel(multiplier, shipFrameMovementFx8, isSetupScreen)
        asteroids[i].preRender(renderer)
    }

    if (carrierInstance) {
        carrierInstance.updateWorldFromModel(multiplier, shipFrameMovementFx8, isSetupScreen)
        carrierInstance.preRender(renderer)
    }
    if (seaInstance) {
        seaInstance.updateWorldFromModel(multiplier, shipFrameMovementFx8, isSetupScreen)
        seaInstance.preRender(renderer)
    }
    if (cloudInstance) {
        cloudInstance.updateWorldFromModel(multiplier, shipFrameMovementFx8, isSetupScreen)
        cloudInstance.preRender(renderer)
        cloud2Instance.updateWorldFromModel(multiplier, shipFrameMovementFx8, isSetupScreen)
        cloud2Instance.preRender(renderer)
    }
    perfUpdateScene.end()
}

/*
rotateZ(-Math.PI / 2)
rotateX(0 * Math.PI / 180)
rotateY(-30 * Math.PI / 180)
*/

const perfUpdate = simpleperf.getCounter("update")

let buttonBPressed = false
let buttonBOtherAction = false

const doUpdate = function() {
    perfUpdate.start()
    let tick = game.runtime()

    let multiplier = 1
    if (lastTick) {
        const lastFrameDeltaMillis = tick - lastTick
        const targetMillis = 20 // 50 fps => 20ms per frame
        multiplier = Math.constrain(lastFrameDeltaMillis / targetMillis, 1, 5)
    }
    lastTick = tick

    if (isSetupScreen) {
        updateScene(multiplier, [Fx.zeroFx8, Fx.zeroFx8, Fx.zeroFx8])
        perfUpdate.end()
        return
    }

    let rotAngle = multiplier * rotAngleDegPerFrame * Math.PI / 180
    const pitchRateDirection = controlInvertY ? -pitchRate : pitchRate

    let speed = baseSpeed
    if (buttonMoveOnly) {
        speed = controller.B.isPressed() ? baseSpeed : 0
    } else {
        if (controller.B.isPressed()) {
            if (!buttonBPressed) {
                // This is the start of a button press
                buttonBPressed = true
                buttonBOtherAction = false
            }
        } else {
            if (buttonBPressed) {
                // This is a button release
                if (!buttonBOtherAction) {
                    // Treat as boost (attempt)
                    if (boostActive < boostReleaseFrames) {
                        boostActive = boostSustainFrames + boostReleaseFrames
                        soundBoost.play(100)
                    }
                }
                buttonBPressed = false
            }
        }

        if (buttonBPressed) {
            if (controller.up.isPressed()) {
                throttleSetting += 0.2 * multiplier
                if (throttleSetting > maxThrottle) throttleSetting = maxThrottle
                buttonBOtherAction = true
            } else if (controller.down.isPressed()) {
                throttleSetting -= 0.2 * multiplier
                if (throttleSetting < minThrottle) throttleSetting = minThrottle
                buttonBOtherAction = true
            }
        }
        if (controller.player2.up.isPressed()) {
                throttleSetting += 0.2 * multiplier
                if (throttleSetting > maxThrottle) throttleSetting = maxThrottle
        }
        if (controller.player2.down.isPressed()) {
                throttleSetting -= 0.2 * multiplier
                if (throttleSetting < minThrottle) throttleSetting = minThrottle
        }
        //console.log("throttle=" + throttleSetting)
        speed = speed * throttleSetting / 5

        // Boost runs for active + release time, and can be re-triggered
        // during the release time.
        /*
        if (controller.B.isPressed() && boostActive < boostReleaseFrames) {
            boostActive = boostSustainFrames + boostReleaseFrames
            soundBoost.play(100)
        }
        */
        if (boostActive > boostReleaseFrames) {
            speed += boostSpeed
        } else if (boostActive > 0) {
            speed += Math.floor(boostSpeed * boostActive / boostReleaseFrames)
        }
        //let speed = boostActive > 0 ? boostSpeed : baseSpeed
        boostActive -= multiplier
        if (boostActive < 0) boostActive = 0
    }

    let stickX = 0
    let stickY = 0
    if (controlAnalogStick) {
        stickX = (controller.left.pressureLevel() - controller.right.pressureLevel()) / 512
        stickY = (controller.up.pressureLevel() - controller.down.pressureLevel()) / 512
    } else {
        if (controller.left.isPressed()) stickX = 1
        if (controller.right.isPressed()) stickX = -1
        if (controller.up.isPressed()) stickY = 1
        if (controller.down.isPressed()) stickY = -1
    }
    if (stickX != 0) {
        if (stickRoll) {
            rotateZ(stickX * rotAngle * rollRate)
        } else {
            rotateY(stickX * rotAngle * yawRate)
        }
    }
    if (controller.player2.left.isPressed()) {
            rotateY(rotAngle * yawRate)
    }
    if (controller.player2.right.isPressed()) {
            rotateY(-rotAngle * yawRate)
    }
    if (stickY != 0 && !buttonBPressed) {
        rotateX(stickY * rotAngle * pitchRateDirection)
    }
    // The ship's movement this frame is -speed * orientation.z
    // (-z is forward).

    shipFrameMovement[0] = -viewerPose[6] * speed * multiplier
    shipFrameMovement[1] = -viewerPose[7] * speed * multiplier
    shipFrameMovement[2] = -viewerPose[8] * speed * multiplier

    if (accelerometerRoll || accelerometerYaw) {
        const accel = [
            controller.acceleration(ControllerDimension.X) / 1000,
            controller.acceleration(ControllerDimension.Y) / 1000,
            controller.acceleration(ControllerDimension.Z) / 1000]
        if (accelerometerRoll) {
            const rollAngle = -accel[0] / 10
            rotateZ(rollAngle)
        }
        if (accelerometerYaw) {
            const yawAngle = -accel[0] / 10
            rotateY(yawAngle)
        }
        if (accelerometerPitch) {
            // Z movement based on 45-degree neutral angle: viewer[2] += accel[1] + accel[2]
            const pitchAccel = (accel[1] + accel[2]) * 2
            rotateX(-rotAngle * pitchRateDirection * pitchAccel)
        }
    }

    viewerPose[9] += shipFrameMovement[0]
    viewerPose[10] += shipFrameMovement[1]
    viewerPose[11] += shipFrameMovement[2]
    vec_convert_to_Fx8(shipFrameMovementFx8, [0, 0, 0])
    //console.log("at " + viewerPose[9] + ", " + viewerPose[10] + ", " + viewerPose[11])

    // Alternate method: player stays at [0, 0, 0], everything else moves
    //vec_convert_to_Fx8(shipFrameMovementFx8, shipFrameMovement)

    updateScene(multiplier, shipFrameMovementFx8)

    // Check for crashing into an asteroid
    let shipDestroyed = false
    for (let i = asteroids.length - 1; i >= 0; --i) {
        const x = asteroids[i].getX()
        const y = asteroids[i].getY()
        const z = asteroids[i].getZ()
        const d2 = Math.imul(x, x) + Math.imul(y, y) + Math.imul(z, z) >> FP_ONE
        // The asteroid radius is 2 units, or 4 when squared. Use a slightly
        // larger radius when checking for collisions to simulate that the ship
        // extends outwards a bit also.
        const r_squared = 5 << FP_BITS_SQ
        if (collisionsEnabled && d2 < r_squared) {
            soundExploded.play(200)
            info.changeLifeBy(-1)
            asteroids.splice(i, 1)
            scene.cameraShake(8, 800)
            shipDestroyed = true
            break
        }
    }
    if (viewerPose[10] < 0) {
        // crashed into ocean
        soundExploded.play(200)
        info.changeLifeBy(-1)
        scene.cameraShake(8, 800)
        // Place ship back somewhere reasonable
        for (let i = 0; i < 12; ++i) {
            viewerPose[i] = viewerPoseStart[i]
        }
        shipDestroyed = true
    }
    if (shipDestroyed) {
        startNextWaveIfAllDestroyed()
    }

    if (controller.A.isPressed() && !firing) {
        //shootLaser()
    }
    if (!firing) {
        laserPower = Math.min(laserPowerMax, laserPower + multiplier)
    }
    if (firing) {
        firing -= multiplier
        if (firing < 0) firing = 0
    } else if (nextWaveCountdown) {
        nextWaveCountdown -= multiplier
        if (nextWaveCountdown < 0) nextWaveCountdown = 0
    } else {
        if (!asteroids.length) {
            spawnAsteroids()
        }
    }
    perfUpdate.end()
}

game.onUpdate(doUpdate)

function runBenchmark() {
    asteroids = []
    waveNum = 0
    spawnAsteroids()
    asteroids[0].worldFromModel[9] = 0
    asteroids[0].worldFromModel[10] = 0
    asteroids[0].worldFromModel[11] = -4 * FP_ONE

    game.pushScene()

    const img = scene.backgroundImage()

    /*
    let text = ""
    const results = []
    img.fill(0)
    results.push(["drawStarfield", control.benchmark(() => starfield.draw(img))])

    renderer.useFlatShading = true
    results.push(["updateScene", control.benchmark(() => updateScene(1, [0, 0, 0]))])
    results.push(["drawLayer3D (flat)", control.benchmark(() => drawLayer3D(img, null))])

    updateScene(1, [Fx.zeroFx8, Fx.zeroFx8, Fx.zeroFx8])
    renderer.useFlatShading = false
    results.push(["drawLayer3D (dithered)", control.benchmark(() => drawLayer3D(img, null))])

    updateScene(1, [Fx.zeroFx8, Fx.zeroFx8, Fx.zeroFx8])
    renderer.useFlatShading = true
    Polygon.clipAndDrawPolygon(renderer.xstarts, [[0, 0, 0], [0, 119, 0], [159, 119, 0], [159, 0, 0]], 30, 0)
    results.push(["drawLayer3D (flat, full BG)", control.benchmark(() => drawLayer3D(img, null))])

    updateScene(1, [Fx.zeroFx8, Fx.zeroFx8, Fx.zeroFx8])
    renderer.useFlatShading = false
    Polygon.clipAndDrawPolygon(renderer.xstarts, [[0, 0, 0], [0, 119, 0], [159, 119, 0], [159, 0, 0]], 30, 0)
    results.push(["drawLayer3D (dithered, full BG)", control.benchmark(() => drawLayer3D(img, null))])

    for (let i = 0; i < results.length; ++i) {
        const result = results[i]
        text += result[0] + ": " + result[1] + "\n"
    }
    game.showLongText(text, DialogLayout.Full)
    */

    renderer.useFlatShading = true
    simpleperf.enable()
    for (let i = 0; i < 100; ++i) {
        img.fill(0)

        updateScene(1, [Fx.zeroFx8, Fx.zeroFx8, Fx.zeroFx8])
        drawLayer3D(img, null)
    }
    simpleperf.disableAndShowResults()

    game.popScene()
}