'use strict';
const fs = require('fs');
const argv = require('yargs')
    .alias("v", "verbose")
    .alias("brokenDir", "brokenDirectory")
    .alias("ref", "referenceFile")
    .describe("v", "Show debug messages")
    .describe("ref", "Reference to a working File captured with the same camera / device")
    .describe("brokenDir", "The directory with the broken Video files")
    .usage("Usage: node main.js --ref working.mov --brokenDir myDirectoryWithBrokenFiles")
    .demandOption(["brokenDir", "ref"])
    .argv;
const path = require('path');
const chalk = require('chalk');
const tmp = require('tmp');
const readline = require('readline');
const { findCommands, transformCommand } = require('./commands');
const logger = {
    info: text => {
        console.log(chalk.black.bgBlue("Info:") + " " + text)
    },
    error: text => {
        console.log(chalk.black.bgRed(text))
    },
    success: text => {
        console.log(chalk.black.bgGreen("Success:") + " " + text)
    },
    debug: text => {
        console.log(chalk.magenta("Debug: ") + text)
    },
    transferToDebug: str => {
        str.split("\n").forEach(x => logger.debug(x));
    },
    writeLine: text => {
        console.log(chalk.black.bgBlue(`--------- ${text} ---------`));
    }
};

if(fs.existsSync(argv.brokenDirectory) && fs.existsSync(argv.referenceFile)) {
    const { exec, execSync } = require('child_process');

    const directoryWithBroken = path.resolve(argv.brokenDirectory),
        referenceFile = path.resolve(argv.referenceFile),
        verbose = argv.v;
    // Create Header files for .mov files with the passed in Reference
    logger.info("Creating Header Files...");
    exec(`recover_mp4.exe ${path.resolve(referenceFile)} --analyze`, (err, stdout, stderr) => {
        try {
            if(err) throw new Error(err);
            else if(verbose) logger.transferToDebug(stdout);
            logger.success("Header Files created");


            logger.writeLine("ENCODING AND DECODING STARTING")
            // Decode to .h264 and .wav using header files from reference
            // Afterwards encode it again using those created .h264 and .wav files
            const commandObj = findCommands(stdout) || {
                decodeCommand: "recover_mp4.exe corrupted_file result.h264 result.wav --eos3",
                encodeCommand: "ffmpeg.exe -i result.h264 -i result.wav -map 0 -map 1:a -c:v copy -c:a:0 copy -c:a:1 aac outputs/outputFile.mov"
            };

            fs.readdir("outputs/", (err, files) => {
                try {
                    if(err) throw new Error(err);
                    if (files.length > 1) {
                        throw new Error("The Folder outputs/ is only allowed to have the tmp/ directory. You must delete / move the rest!");
                    }
                } catch (error) {
                    logger.error(error);
                    process.exit(1);
                }
            });

            let consoleOutput = {stdin: "", stdout: "", stderr: ""};
            const execOptions = {stdio: [consoleOutput.stdin, consoleOutput.stdout, consoleOutput.stderr],};
            fs.readdir(directoryWithBroken, (err, files) => {
                files.forEach(file => {
                    const fullFilePath = path.resolve(`${directoryWithBroken}/${file}`);
                    fs.stat(fullFilePath, (err, stat) => {
                        if(stat.isFile()) {
                            const id = path.basename(file, path.extname(file));
                            logger.info(`Encoding and Decoding File ${id}`);

                            const commands = transformCommand(commandObj, id, fullFilePath);
                            execSync(commands.decodeCommand, execOptions);
                            execSync(commands.encodeCommand, execOptions);


                            logger.success(`Repaired File ${file}! Check if file works now.`);
                        }
                    })
                });
            });
        } catch (error) {
            logger.error(error);
            process.exit(1);
        }
    });
} else {
    logger.error("The File Directory has to be a string")
    process.exitCode = 1;
}