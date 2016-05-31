# Flexbot
Updates flex mls prices based on lechuga verde and centrifuga.
- This repo is for versions +2.0

* Meteor backend.
  * Website Automation with [nightmare-meteor](https://github.com/rickmed/nightmare-meteor) on backend.

* Front-end: react + mobx.

### Development

* React hot module reloading and babel development support with [meteor-hmr](https://github.com/gadicc/meteor-hmr) package (see imports/client/lib/index.jsx inside client folder for how to use it)

* .development/ includes a way a test nightmare-meteor scripts in the meteor client. for reattaching nightmare sessions for faster developing.
  * Meteor client (localhost:3000) is loaded in electron's main.js.
  * See meteor-app/settings.json for production/development environments.

* Meteor toys for mongo and sessions debugging.

- Additionally, [meteor-electron-nightmare](https://github.com/rickmed/meteor-electron-nightmare) for similar references.

### Meteor packages

```
meteor-base             # Packages every Meteor app needs to have
mongo                   # The database Meteor supports right now
tracker                 # Meteor's client-side reactive programming library

standard-minifier-css   # CSS minifier run for production mode
standard-minifier-js    # JS minifier run for production mode

static-html

autopublish             # Publish all data to the clients (for prototyping)
insecure                # Allow all DB writes from clients (for prototyping)

# ecmascript
gadicc:ecmascript-hot    # React HMR and .babelrc support

meteortoys:allthings     # mongo, session debugging
```

### settings.json
In meteor-app folder:
```
{
  "public": {
    "production": "no",
    "nightmare-dev": "yes",
    "user": string,
    "pw": string
  }
}
```

### Notes
- .development/ will not be bundled by meteor (stats with .). Not even uploaded to heroku since it is in .slugignore.

- setting nodejs env vars in windows is:
```set FLX_USER=y & set FLX_PW=x & set DEBUG=nightmare:actions* & npm run meteor```

- Nightmare Debug Flags:
```
All nightmare messages

DEBUG=nightmare*

Only actions

DEBUG=nightmare:actions*

Only logs

DEBUG=nightmare:log*
```
