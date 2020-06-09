#!/usr/bin/env node
const activeWin = require('active-win');
const moment = require('moment')
const ioHook = require('iohook-openb3');
const sysInfo = require('systeminformation');
const express = require('express')
const app = express()

let msInactive = 300000
const timeToCheck = 5000
const version = "0.0.12"
var lastActive = 0
let activeApp = {
    urlTimes: {},
    appTimes: {}
}

let intervalId = null
let notActive = null
function getActiveWin() {
    const nowTime = moment().valueOf()
    const activeWIn =  activeWin.sync()
    console.log("active-win", activeWIn)

    if (nowTime - lastActive > msInactive) {
        console.log("user is not active",nowTime - lastActive,activeApp)
        ioHook.stop();
        clearInterval(intervalId)
        intervalId = null
        notActive = {
            lastActive
        }
        lastActive = 0
    } else if (activeWIn && activeWIn.owner) {
        if (activeApp.appTimes[activeWIn.owner.name] == undefined) {
            activeApp.appTimes[activeWIn.owner.name] = timeToCheck
        } else {
            activeApp.appTimes[activeWIn.owner.name] = activeApp.appTimes[activeWIn.owner.name] + timeToCheck
        }
        if (activeWIn.url) {
            if (activeApp.urlTimes[activeWIn.url] == undefined) {
                activeApp.urlTimes[activeWIn.url] = timeToCheck
            } else {
                activeApp.urlTimes[activeWIn.url]  = activeApp.urlTimes[activeWIn.url]  +  timeToCheck
            }
        }
        console.log("user is active",nowTime - lastActive,activeApp)
    }
}



ioHook.on("mousemove", event => {
    const nowTime = moment().valueOf()
    // if (now - lastActive > msInactive) {
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



app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods","GET,PUT,POST,DELETE,OPTIONS")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})


app.get('/tracker/start', async (req, res,next) => {
    console.log("tracker/start",req.query)
    const { actionId,resume,inactiveMs} = req.query
    if (actionId == undefined) {
        return res.send({error: "requires actionId query param"})
    }

    if (inactiveMs) {
        msInactive = inactiveMs
    }
    if (activeApp.actionId !== undefined && activeApp.actionId !== actionId) {
        return res.send({error: "Started action for " + actionId + " but we are tracking " + activeApp.actionId })
    }
    //Register and stark hook 
    console.log("tracker start api notActive",notActive,resume)
    if (notActive !== null && resume == undefined) {
        res.send(notActive)
        notActive = null
        return
    }

    if (lastActive !== 0 && resume == undefined) {
        console.log("tracker has already been started")
        return res.send(activeApp)
    }

    if (resume !== undefined) {
        console.log("tracker/start going to resume on ",resume,lastActive,(moment().valueOf() - resume)/1000)
        lastActive = resume
    } 
    if (lastActive == 0) {
        lastActive = moment().valueOf()
    }
    console.log("tracker/start lastActive",lastActive)

    activeApp.version = version
    
    activeApp.actionId = actionId
    ioHook.start();
    if (intervalId == null) {
        intervalId = setInterval(getActiveWin, timeToCheck)
    }
    

    res.send(activeApp)
})

app.get('/tracker/stop', async (req, res,next) => {
    console.log("tracker/stop",req.query)
    const { actionId } = req.query
    if (actionId == undefined) {
        return res.send({error: "requires actionId query param"})
    }
    if (activeApp.actionId !== undefined && activeApp.actionId !== actionId) {
        return res.send({error: "stopping action for " + actionId + " but we are tracking " + activeApp.actionId })
    }
    //Register and stark hook 
    ioHook.stop();
    clearInterval(intervalId)
    intervalId = null
    lastActive = 0
    
    // setInterval(getActiveWin, timeToCheck)
    res.send(activeApp)
    activeApp = {
        urlTimes: {},
        appTimes: {}
    }
    console.log('tracker/stop activeApp',activeApp)
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
