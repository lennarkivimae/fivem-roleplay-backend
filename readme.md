# FiveM Roleplay backend

 These are server-side scripts for GTA 5 multiplayer modification FiveM.
This is work in progress to be roleplaying script for custom server.
This is build on typescript, using mysql / mariadb as it's database. Using webpack to make a build

## Before you continue
 * Read the official FiveM documentation on how to setup server, and it's corresponding scripts.<br>
 https://docs.fivem.net/docs/server-manual/setting-up-a-server/

 * API documentation and methods can be found here:<br>
   https://docs.fivem.net/natives/

## How to install
 Once you have your server setup, run:
 ```
    npm ci
 ```
 * Create an .env file, example is provided
 * Open server.config.js and change path for env directory. This is a quirk as process.cwd is pointing to different directory than where script is located at.
 * Change fxmanifest.lua and point 'server_script' to correct path relative to where fxmanifest is located at. Which should be root folder of your gamemode. example:
```
    fx_version 'cerulean'
    game 'gta5'

    name ''
    description '(WIP) Roleplaying script'
    author 'Lenny'
    url ''

    ui_page 'client/dist/index.html'

    files {
        'client/dist/index.html',
        'client/dist/gui/gui.js',
        'client/dist/css/gui.css'
    }

    client_script 'client/dist/client.js'
    server_script 'server/dist/server.js'
```

## Development
* For development and watch for file changes, run:
```
    npm run dev
```

## Production
 * WIP

I might have forgotten something in the process.... have fun!

If you have something awesome to add, throw a PR!
Also this is MIT, so do what you will. However a shoutout is always nice if this is any of help.
