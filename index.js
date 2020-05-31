#!/usr/bin/env node
const activeWin = require('active-win');
const moment = require('moment')
const ioHook = require('iohook-openb3');
const sysInfo = require('systeminformation');
const express = require('express')
const app = express()


var msWait = 30000
var timeToCheck = 5000

let activeApp = {}
let urlTimes = {}
let intervalId
function getActiveWin() {
    const nowTime = moment().valueOf()
    const activeWIn =  activeWin.sync()
    // console.log("active-win", activeWIn)

    if (nowTime - lastActive > msWait) {
        console.log("user is not active",nowTime - lastActive,activeApp,urlTimes)
    } else {
        if (activeApp[activeWIn.owner.bundleId] == undefined) {
            activeApp[activeWIn.owner.bundleId] = timeToCheck
        } else {
            activeApp[activeWIn.owner.bundleId] = activeApp[activeWIn.owner.bundleId] + timeToCheck
        }
        if (activeWIn.url) {
            if (urlTimes[activeWIn.url] == undefined) {
                urlTimes[activeWIn.url] = timeToCheck
            } else {
                urlTimes[activeWIn.url]  = urlTimes[activeWIn.url]  +  timeToCheck
            }
        }
        console.log("user is active",nowTime - lastActive,activeApp,urlTimes)
    }
}

var lastActive = moment().valueOf()

ioHook.on("mousemove", event => {
    const nowTime = moment().valueOf()
    // if (now - lastActive > msWait) {
    //     console.log("mousemove no activity for 50000")
        
    // }
    lastActive = nowTime
    // console.log("mousemove",lastActive)

    // result: {type: 'mousemove',x: 700,y: 400}
  });
ioHook.on("keydown", event => {
    const nowTime = moment().valueOf()
    // if (now - lastActive > 50000) {
    //     console.log("keydown no activity for 50000")
        
    // }
    lastActive = nowTime
    // console.log("keydown",lastActive)
// result: {keychar: 'f', keycode: 19, rawcode: 15, type: 'keypress'}
});


app.get('/tracker/start', async (req, res,next) => {
    console.log("tracker/start",req.headers)
    //Register and stark hook 
    ioHook.start();
    intervalId = setInterval(getActiveWin, timeToCheck)
    res.send(200)
})

app.get('/tracker/stop', async (req, res,next) => {
    console.log("tracker/stop",req.headers)
    //Register and stark hook 
    ioHook.stop();
    clearInterval(intervalId)
    // setInterval(getActiveWin, timeToCheck)
    res.send(200)
})

app.get('/sysInfo/system', async (req, res,next) => {
    console.log("localTracker/sysInfo/system",req.headers)
    const sysInfoSystem = await sysInfo.system().then(data => {return data})


    const sysInfoCpu = await sysInfo.cpu().then(data => {return data})

    const sysInfoMem = await sysInfo.mem().then(data => {return data})

    const sysInfoOs = await sysInfo.osInfo().then(data => {return data})
    console.log("sysInfoSystem",sysInfoSystem,sysInfoCpu,sysInfoMem,sysInfoOs)
    res.send({
        system: sysInfoSystem,
        cpu: sysInfoCpu,
        mem: sysInfoMem,
        os: sysInfoOs
    })
})
    
app.listen(4448).on('error', (err) => {
    console.error("localtracker express error",err)
    throw err

})
