const exportObj = module.exports = {}



exportObj.findCommands = (stdout) => {
    const array = stdout.split("\n");
    const decodeIndex = array.findIndex(elem => elem.includes("Now run the following command to start recovering")) + 1;
    const encodeIndex = array.findIndex(elem => elem.includes("Then use ffmpeg to mux the final file:")) + 1;
  
    if(typeof encodeIndex !== 'number' && typeof decodeIndex !== 'number') {
      return;
    }
    return {
      decodeCommand: array[decodeIndex].replace("\r", ""),
      encodeCommand: array[encodeIndex].replace("\r", "")
    }
}

exportObj.transformCommand = (obj, id, idWithExt) => {
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };

    let decode = obj.decodeCommand;
    let encode = obj.encodeCommand;

    decode = decode.replaceAll("corrupted_file", `"${idWithExt}"`);
    decode = decode.replaceAll("result", `outputs/tmp/${id}`);

    let encodeArr = encode.split(" ");
    encodeArr[encodeArr.length-1] = encodeArr[encodeArr.length-1].replace("result", `outputs/${id}`);
    encode = encodeArr.join(" ");

    encode = encode.replaceAll("result", `outputs/tmp/${id}`);
    return {
        decodeCommand: decode,
        encodeCommand: encode
    };
} 