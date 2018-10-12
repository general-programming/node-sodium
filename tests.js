var exec = require("child_process").exec;
var os = require("os");
var fs = require("fs");

function run(cmdLine, expectedExitCode) {
    return new Promise(function(resolve, reject) {
        console.log("=>> " + cmdLine);
        var c = exec(cmdLine);

        if (typeof expectedExitCode === "undefined") {
            expectedExitCode = 0;
        }

        c.stdout.on("data", function(data) {
            process.stdout.write(data.toString());
        });
        c.stderr.on("data", function(data) {
            process.stdout.write(data.toString());
        });
        c.on("exit", function(code) {
            if (code !== expectedExitCode) {
                reject(new Error(cmdLine + " exited with code " + code));
            }

            resolve();
        });
    });
}

function exists(path) {
    try {
        fs.accessSync(path, fs.F_OK);
        return true;
    } catch (e) {
// Only for debug purposes
//
//        fs.readdirSync(__dirname).forEach(file => {
//            console.log(file);
//        });
        return false;
    }
}

function handleErr(err) {
    console.error("!! Error encountered while building:");
    console.error(err);
    process.exit(1);
}

if (os.platform() !== "win32") {
    run("make test")
        .then(() => process.exit(0))
        .catch(handleErr);
} else {
    console.log("Checking if build is successful...");
    console.log("Checking for `build/Release/sodium.node`...");
    if (exists("build\\Release\\sodium.node")) {
        console.log("`build/Release/sodium.node` is found, checking if mocha is available...");

        if (exists("node_modules\\.bin\\mocha.cmd")) {
            console.log("mocha is available. Test is starting...");
            run("set NODE_ENV=test&&\"node_modules\\.bin\\mocha.cmd\" --reporter mocha-junit-reporter")
                .then(() => process.exit(0))
                .catch(handleErr);
        } else {
            console.log("mocha is not available. Exiting...");
            process.exit(0);
        }

    } else {
        console.error("`build/Release/sodium.node` is NOT found, exiting...");
        process.exit(1);
    }
}
