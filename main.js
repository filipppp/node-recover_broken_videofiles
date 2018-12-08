'use strict';
const fs = require('fs');
const {argv} = require('yargs');
const path = require('path');
const chalk = require('chalk');
const { findCommands, transformCommand } = require('./commands');
const logger = {
  info: text => {
    console.log(chalk.blue("Info:") + " " + text)
  },
  error: text => {
    console.log(chalk.black.bgRed("Error: "+text))
  },
  success: text => {
    console.log(chalk.black.bgGreen("Success:") + " " + text)
  },
  debug: text => {
    console.log(chalk.magenta("Debug: ") + text)
  },
  transferToDebug: str => {
    str.split("\n").forEach(x => logger.debug(x));
  }
}

if(fs.existsSync(argv.fileDirectory) && fs.existsSync(argv.referenceFile)) {
  const { exec, execSync } = require('child_process');

  const directoryWithBroken = path.resolve(argv.fileDirectory),
        referenceFile = path.resolve(argv.referenceFile),
        verbose = argv.v;
  try {
    // Create Header files for .mov files with the passed in Reference
    exec(`recover_mp4.exe ${path.resolve(referenceFile)} --analyze`, (err, stdout, stderr) => {
      logger.info("Creating Header Files...")
      if(err) throw err;
      else if(verbose) logger.transferToDebug(stdout);
      logger.success("Header Files created")

      // Decode to .h264 and .wav using header files from reference
      // Afterwards encode it again using those created .h264 and .wav files
      const commandObj = findCommands(stdout) || {
        decodeCommand: "recover_mp4.exe corrupted_file result.h264 result.wav --eos3",
        encodeCommand: "ffmpeg.exe -i result.h264 -i result.wav -map 0 -map 1:a -c:v copy -c:a:0 copy -c:a:1 aac outputs/outputFile.mov"
      };
      fs.readdir(directoryWithBroken, (err, files) => {
        files.forEach(file => {
          const fullFilePath = path.resolve(`${directoryWithBroken}/${file}`);
          fs.stat(fullFilePath, (err, stat) => {
            if(stat.isFile()) {
              // Encode File
              const id = path.basename(file, path.extname(file));
              logger.info(`Encoding and Decoding File ${id}`);  


              const commands = transformCommand(commandObj, id, fullFilePath);
              let string = execSync(commands.decodeCommand, (err, stdout, stderr) => {
                if(err) throw err;
                if(verbose) logger.transferToDebug(stdout);
              
               
              });
              let kekk = execSync(commands.encodeCommand, (err, stdout, stderr) => {
                if(true) logger.transferToDebug(err);
              });
              logger.success(`Repaired File ${file}! Check if file works now.`);  
            }
          })
        });
      });
    });
  } catch (error) {
    logger.error(error);
  }
} else {
  
  logger.error("The File Directory has to be a string")
  process.exitCode = 1;
}