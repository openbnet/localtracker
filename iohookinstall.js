// const path = require('path');
// const runtime = process.versions['electron'] ? 'electron' : 'node';
// const essential = runtime + '-v' + process.versions.modules + '-' + process.platform + '-' + process.arch;
// const modulePath = path.join(__dirname, 'builds', essential, 'build', 'Release', 'iohook.node');
// console.info('The path is:', modulePath);
var which = require('which')
 
var AutoLaunch = require('auto-launch');


const trackerBinPath = which.sync('localTracker', {nothrow: true})

if (trackerBinPath == null) {
    return console.error("Cant find localTracker, need to install it first")
}

const nodeBinPath = which.sync('node', {nothrow: true})

if (nodeBinPath == null) {
    return console.error("Cant find node, need to install it first")
}

console.log("trackerBinPath",trackerBinPath)
var autoLauncher = new AutoLaunch({
    name: 'LocalTracker',
    path: nodeBinPath,
    extraArgs: trackerBinPath,
    mac: {
        useLaunchAgent: true
    }
});
 
autoLauncher.enable();
 
//autoLauncher.disable();
 
 
autoLauncher.isEnabled()
.then(function(isEnabled){
    if(isEnabled){
        return;
    }
    autoLauncher.enable();
})
.catch(function(err){
    // handle error
    console.error("autolauncher error",err)
});