// const path = require('path');
// const runtime = process.versions['electron'] ? 'electron' : 'node';
// const essential = runtime + '-v' + process.versions.modules + '-' + process.platform + '-' + process.arch;
// const modulePath = path.join(__dirname, 'builds', essential, 'build', 'Release', 'iohook.node');
// console.info('The path is:', modulePath);

var AutoLaunch = require('auto-launch');
 
var localTrackerLauncher = new AutoLaunch({
    name: 'Local Tracker',
    path: 'localTracker',
});
 
localTrackerLauncher.enable();
 
//localTrackerLauncher.disable();
 
 
localTrackerLauncher.isEnabled()
.then(function(isEnabled){
    if(isEnabled){
        return;
    }
    localTrackerLauncher.enable();
})
.catch(function(err){
    // handle error
    console.error("autolauncher error",err)
});