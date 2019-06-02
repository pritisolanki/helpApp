
const readline = require('readline');

const port = process.env.COM_SERVER_PORT || 9432
const serverAddress = process.env.COM_SERVER_ADDRESS || '35.226.214.55';

const helpClient = require('./model/helpclient');
const hclient = new helpClient(port,serverAddress);


(async() => {
    //Connect and log in to the system
    const login = await hclient.login('sandiego');
    console.log('Login', login);

    const stdin = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    //Handle input from STDIN
    callCommand = async (cmd)=>{
       return await hclient.sendCommand(cmd);
    }

    stdin.on('line', async line => {
        try { 
            const command = JSON.parse(line);
            if(command.length >= 2)
            {
                //time call check [{"request":"time"},{"request":"count"}]
                for(let ind in command){
                    const response = await hclient.sendCommand(command[ind]);        
                    console.log(response);
                    if(response.msg.random != undefined && response.msg.random > 10)
                    console.log('Greater than 30!');
                }
                
            }else{
                const response = await hclient.sendCommand(command);        
                console.log(response);
                if(command.request === "time" && response.msg.random > 30)
                    console.log('Greater than 30!');
            }

        } catch(e) {
            console.log(`Invalid JSON ${e}`);
        }
    });
})();