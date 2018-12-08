# Node Recover Video Files

Node Application to recreate headers for mp4s and movs with existing references with FFMPEG and Rescue_mp4.

## Getting Started

Clone the github repo

```
git clone https://github.com/filipppp/node-recover_broken_videofiles.git
```

### Prerequisites

You'll need [NodeJS](https://nodejs.org/en/) installed on your system.

### Installing

After cloning the Github Repo you have to install the dependencies.

```
cd node-recover_broken_videofiles/
npm install
```


End with an example of getting some data out of the system or using it for a little demo

## Usage


```

Usage: node main.js --ref working.mov --brokenDir myDirectoryWithBrokenFiles

Options:
  --help                          Show help                            [boolean]
  --version                       Show version number                  [boolean]
  -v, --verbose                   Show debug messages
  --ref, --referenceFile          Reference to a working File captured with the
                                  same camera / device                [required]
  --brokenDir, --brokenDirectory  The directory with the broken Video files
                                                                      [required]

```



## Built With

* [Rescue_mp4](http://slydiman.me/eng/mmedia/recover_mp4.htm) - Used for decoding
* [FFMPEG](https://www.ffmpeg.org/) - Used for encoding
