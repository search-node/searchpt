This is search prototype that is used to test and build the AngularJS front end
used in the Drupal modules.

# Build
To build the two minified JavaScript files used by the Drupal modules install
gulp and the module defined in package.json

 * npm install --global gulp
 * npm install
 * gulp build --production

The two files will be located in build folder and needs AngularJS 1.4.x as well
to be used.

# Docker
Simple docker file included. Usage:

 * docker build -t searchchpt .
 * docker run -it --rm -v $PWD:/data searchchpt npm install
 * docker run -it --rm -v $PWD:/data searchcpht gulp build --production
