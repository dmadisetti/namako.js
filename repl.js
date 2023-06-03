
let path = require('path');
let fs = require('fs');
var sona = require("./sona.js");
const readline = require('readline');
const util = require('util');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = util.promisify(rl.question).bind(rl);


function run(data) {
  let idx = 0;
  let queue = [];
  data = ("\n"+data).split("\n")
  interperter = sona(()=>{
    return queue.shift();
  })

  interperter(async (l, callback, stack)=>{
    if(l > data) {
      console.error(`ike tawa (linja ${l})`);
      process.stdout.write('\x1b[0m');
      process.exit(1);
      return callback("pini");
    }
    if (idx < stack.length){
      let slice = stack.slice(idx);
      if (typeof stack[idx] == 'string'){
        console.log([slice.join('')]);
        process.stdout.write('\x1b[0m');
      } else{
        if (slice.length == 1) console.log(stack[idx])
        else console.log(slice);
        process.stdout.write('\x1b[0m');
      }
      idx = stack.length;
    }
    let line = data[l];
    let user = l == data.length;
    if(user) {
      line = await prompt(">> ")
      process.stdout.write('\x1b[0m');
      data.push(line)
    }
    trimmed = line.trim();
    if (trimmed.startsWith("o pana e ")) {
        let L = trimmed.split(/\s+/).length - 3
        while (queue.length < L) {
          let input = await prompt("?> ");
          process.stdout.write('\x1b[0m');
          try {
              queue = queue.concat(interperter.evaluate(trimmed));
          } catch(err){
            console.error(err);
          }
        }
    }
    try {
      return callback(line);
    } catch(err){
      let failed = user;
      if (user){
        data.pop()
        let tokens = interperter.token(trimmed).length
        if (tokens == 1 || trimmed.length == tokens + 2) {
          let result = interperter.evaluate(trimmed);
          if (tokens == 1) console.log(result[0])
          else console.log(result);
          process.stdout.write('\x1b[0m');
        } else {
          try {
            console.log(interperter.expression(trimmed))
            process.stdout.write('\x1b[0m');
          } catch(err2){
            console.error(err.message)
            console.error(err2.message)
            process.stdout.write('\x1b[0m');
          }
        }
      } else {
        console.error(err);
        console.error(`ike pali: ${file}`);
        process.stdout.write('\x1b[0m');
        process.exit(1);
      }
    }
  }).then(()=>process.exit(0));
}

function load(){
  let content = ""
  if (process.argv.length == 3) {
    const filePath = path.resolve(process.argv[2]);
        // .then(() => fs.readFile(filePath, 'utf-8'))
        // .then((data)=>run(data))
    fs.access(filePath , fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`lipu awen: ${filePath}`);
            process.exit(1);
        } else {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`ike lipu: ${filePath}`);
                    console.error(err);
                    process.exit(1);
                } else {
                    run(data);
                }
            });
        }
    });
  } else {
    run("")
  }
}

if (typeof require !== 'undefined' && require.main === module) {
    load()
}
