# ngStarter - Fleetplan

## Old DEV Environment

https://dev-fleetplan.it-objects.de/fleetplan/
User: lionc
PW: lionc!

## Swagger

https://dev-fleetplan.it-objects.de/fleetplan/api/swagger-ui/

## DEV

1) npm install
2) npm run start:dev
3) use 'FP2.0User' (any password) for development. login api service is used but username is restricted for development mode (in PROD no login is required, user gets logged-in by iv-user header only OR gets created if iv-user header does not exist in db)
4) please do not overwrite user in environment.dev
5) use https://dev-fleetplan.it-objects.de/fleetplan/ or https://dev-fleetplan.it-objects.de/fleetplan/ to create necessary data
6) alternatively use mock interceptor

## Build

(*optional*)

 - *add a section in src/assets/whats-new.json or at least check that one for the new version is enabled*
 - **count up the version number in package.json (at least the build!)**
 - **run `npm run buildD97`**
 - *hand over the dist/D97 directory to the customer - all replacements ect are already done!*
 - *add a tag in git to mark the code as delivered*
     
## Release Names & Notes

please add a section in src/assets/whats-new.json to add a developer note. the file release-notes is for production and has the same structure
 - whats-new.json is for dev (D97), release-notes.json for production (Q97,P97)
 - you can choose a key on your own but it has to be unique!! as this key is stored when the user sees the changes to determine which section is already viewed.
 - if the "d" property is null the entry is hidden (use this if you want to add changes but do not want to show the dialog)
 - the "v" property is a string, it does not have to be the version number but it could be nice if it is ;)

## i18n extraction 

Run `npm run extract-i18n` ... a file called strings.json will be created in assets/i18n folder

## FAQ

### Heapspace errors

heapspace errors ? --> export NODE_OPTIONS="--max-old-space-size=8192"   


var nowTime = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);

ng update @angular/core @angular/cli @angular/cdk @angular/material @angular/flex-layout ngx-extended-pdf-viewer ngx-pinch-zoom --force

### Environment variables

If you need to define variables dependent on the environment, you have to declare the variable in the values-template.yaml which will be injected to angulars environment.ts through an env.js:

1. Declare variable for specific environment int the values-template.yaml
2. Map the variable to the window object in assets/env/env.js.template
3. Make use of the window object in the environment.ts 
