# Server

## Open the code

In VSCode, open the `Beanie` folder, NOT THE `OpenBeanieProject` FOLDER!!!!!!

## Create a new terminal

In the top left corner of VSCode, click the 3 dots and select `New Terminal`

## Getting the latest version of the code

Run `./reclone.sh` in the terminal. This will delete the current code and download the latest version from GitHub.

## CD into the code

Run `cd OpenBeanieProject` in the terminal.

## Installing packages

First, make sure you install any packages by running `npm install` in the terminal. Then, run `python3 install -r requirements.txt` in the terminal.

## Running the code

Run `npm start` in the terminal.

## Killing the code

To kill the server, spam click `Ctrl + C` in the terminal.

## Starting the code on the PI

while SSHed into the PI's `/home/pi` directory, run `python3 boot.py` in the terminal to start the program.

## Configuring IPs

The config file for the server is located at `OpenBeanieProject/backend/config.json`. You can change the IP address' and port numbers in the `network` section of this file.

```json
"network": {
    "pi": {
        "ip": "192.168.1.62",
        "port": 5000
    },
    "viewer": {
        "port": 8081
    },
    "client": {
        "port": 8080
    },
    "recognizer": {
        "port": 8082
    }
},
```

The only IP you will really need to change is in `pi`. Set it to the IP address of the PI.

If you change anything in the file, you will need to kill and re-run the server using `npm start` in the terminal.

# Accessing the dashboard preview website

In the browser of the same computer running the server, open `http://localhost:8080/` to view the dashboard. If you change the port number in the config file, you will need to change the port number in the URL as well.
