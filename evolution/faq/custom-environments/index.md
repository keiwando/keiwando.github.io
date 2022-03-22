---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: general
order: 12
title: Is it possible to create custom levels?
---

Yes, kind of.

I haven't had time to add any UI for it yet, but it is already possible to modify the environment that the creatures are spawned into (including the physics settings) by editing the simulation save files. So for anyone who feels comfortable doing this, here is how:

The save files are written in JSON format, so you can open them in any text editing program. (If you are having trouble with that, try to change the file extension from .evol to .json). 

One of the keys in this JSON is `"scene"`. The value of this property is the entire scene description, which defines the simulation environment of the creatures. Below you will find an example for such a scene description for an obstacle jump environment (the ground, two walls and an obstacle spawner). You can use this as reference for the available structures that you can place in your custom environments.

Available options are:
- `"evolution::structure::ground"`
- `"evolution::structure::wall"`
- `"evolution::structure::rollingobstaclespawner"`
- `"evolution::structure::stairstep"`
- `"evolution::structure::distancemarkerspawner"`

All of these need a transform property under their `"structureData"`, that defines the
position, scale and rotation of the structure.
The rolling obstacle spawner also needs values for its

`"spawnInterval"`, `"obstacleLifetime"` and `"forceMultiplier"`

properties.

You can also define the path that the camera should follow under the `"cameraControlPoints"` key. E.g. if you add stairs, you'll want to setup your camera control points to make sure that the camera moves at the same angle as the stairs. (The camera path is linearly extrapolated before the first and after the last control point).

Last but not least, please note that none of this is officially "stable". If you misconfigure the save file, the app might crash when trying to load it.

Since I haven't had time to build a proper UI for this yet (and most likely won't in the near future either) I thought I would at least let people who are interested in this know that these options already exist. You can find all of the code related to this custom scene setup [here](https://github.com/keiwando/evolution/tree/master/Assets/Scripts/Scenes).

```
"scene":{
    "version":1,
    "cameraControlPoints":[
        {
          "x":0,
          "y":0,
          "pivot":0.109999999
        },
        {
          "x":1,
          "y":0,
          "pivot":0.109999999
        }
    ],
    "dropHeight":0.5,
    "physicsConfiguration":{
        "gravity":-50,
        "bounceThreshold":2,
        "sleepThreshold":0.00499999989,
        "defaultContactOffset":0.00999999978,
        "defaultSolverIterations":7,
        "defaultSolverVelocityIterations":10,
        "queriesHitBackfaces":false,
        "queriesHitTriggers":true,
        "autoSyncTransforms":false
    },
    "structures":[
        {
          "encodingID":"evolution::structure::ground",
          "structureData":{
              "transform":{
                "x":0.476770997,
                "y":-4.80000019,
                "z":-2.6099999,
                "rotation":0,
                "sX":1000000,
                "sY":9.56000042,
                "sZ":29.7999992
              }
          }
        },
        {
          "encodingID":"evolution::structure::wall",
          "structureData":{
              "transform":{
                "x":-41.7299995,
                "y":-4.80000019,
                "z":-2.6099999,
                "rotation":90,
                "sX":10000,
                "sY":35.7799988,
                "sZ":29.7999992
              }
          }
        },
        {
          "encodingID":"evolution::structure::wall",
          "structureData":{
              "transform":{
                "x":40,
                "y":-4.80000019,
                "z":-2.6099999,
                "rotation":90,
                "sX":10000,
                "sY":35.7799988,
                "sZ":29.7999992
              }
          }
        },
        {
          "encodingID":"evolution::structure::rollingobstaclespawner",
          "structureData":{
              "transform":{
                "x":31.1000004,
                "y":4.40999985,
                "z":0,
                "rotation":180,
                "sX":1,
                "sY":1,
                "sZ":1
              },
              "spawnInterval":5,
              "obstacleLifetime":5,
              "forceMultiplier":1
          }
        }
    ]
}
```