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

First, make sure you install any packages by running `./install.sh` in the terminal.
IF YOU ARE GETTING ERRORS, TRY RUNNING THESE COMMANDS IN THE TERMINAL: `npm install` and then `pip3 install -r requirements.txt`

# CD into the backend directory

Run `cd backend` in the terminal.

## Running the code

Run `npm start` in the terminal.

## Killing the code

To kill the server, use the command `Ctrl + C` in the terminal.

## Starting the code on the PI

While in the PI's `/home/pi` directory, run `python3 boot.py` in the terminal to start the program.

## Configuring IPs

The config file for the server is located at `OpenBeanieProject/backend/config.json`. You can change the IP address' and port numbers in the `network` section of this file.

```

The only IP you will really need to change is in `pi`. Set it to the IP address of the PI.

If you change anything in the file, you will need to kill and re-run the server using `npm start` in the terminal.

# Accessing the dashboard preview website

In the browser of the same computer running the server, open `http://localhost:8080/` to view the dashboard. If you change the port number in the config file, you will need to change the port number in the URL as well.

# HANDLING ERRORS

If you are getting an error on the PI, or the program stops, spam the command `ctrl + d` in the terminal until the program stops. Then, run `python3 boot.py` to restart the program.

If you are getting an error on the server, use the command `ctrl + c` in the terminal and try running `npm start` again in the terminal.
```
