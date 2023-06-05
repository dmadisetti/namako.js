let path = require('path');
let fs = require('fs');
var sona = require("./sona.js");
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (query) => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
    process.once('SIGINT', () => {
      resolve('pini');
    });
  });
};

const indicator = process.env.REPL_PROMPT || '>';

function run(code, interactive, restart, idx, interperter) {
  let queue = [];
  idx = idx | 0;
  data = ("\n"+code).split("\n")
  if (!interperter) {
    interperter = sona(()=>{
      return queue.shift();
    })
  }

  interperter(async (l, callback, stack)=>{
    if(l > data.length) {
      console.error(`ike tawa (linja ${l})`);
      process.exit(1);
    }
    if (idx < stack.length){
      let slice = stack.slice(idx);
      if (typeof stack[idx] == 'string'){
        console.log([slice.join('')]);
      } else{
        if (slice.length == 1) console.log(stack[idx])
        else console.log(slice);
      }
      idx = stack.length;
    }
    let line = data[l];
    let user = l == data.length;
    if(user) {
      if (!interactive || restart) return callback("pini");
      line = await prompt(`${indicator}${indicator} `)
      data.push(line)
    }
    trimmed = line.trim();
    if (trimmed.startsWith("o pana e ")) {
        let L = trimmed.split(/\s+/).length - 3
        while (queue.length < L) {
          let input = (await prompt(`?${indicator} `)).trim();
          try {
            queue = queue.concat(interperter.evaluate(input));
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
        } else {
          try {
            console.log(interperter.expression(trimmed))
          } catch(err2){
            console.error(err.message.split("(")[0])
            console.error(err2.message)
          }
        }
      } else {
        console.error(err);
        interperter.tawa(data.length);
      }
    }
  }).then(()=>{
    if(!restart) {
      process.exit(0)
    }
    interperter.tawa(data.length);
    run(code, true, false, idx, interperter);
  });
}

function load(){
  let content = ""
  let filePath = null;
    
  let invalid = process.argv.length > 4;
  let interactive = true;

  // If there are 3 arguments and the second one is not -i
  if (process.argv.length === 3 && process.argv[2] !== '-i') {
    filePath = path.resolve(process.argv[2]);
    interactive = false;
  }
  // If there are 4 arguments
  else if (process.argv.length === 4) {
    if (process.argv[2] === '-i') {
        filePath = path.resolve(process.argv[3]);
    } else if (process.argv[3] === '-i') {
        filePath = path.resolve(process.argv[2]);
    } else {
      invalid = true;
    }
  }
  if (invalid) {
    console.error(`ike: pali: namako [-i] [lipu]`);
    console.error(process.argv);
    process.exit(1);
  }
  if (filePath) {
    const resolved = path.resolve(filePath);
    fs.access(resolved , fs.constants.F_OK, (err) => {
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
                    run(data, interactive, interactive);
                }
            });
        }
    });
  } else {
    run("", true)
  }
}

if (typeof require !== 'undefined' && require.main === module) {
    load()
}
