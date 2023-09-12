# XView

XView is a web image viewer designed for [XPACS](https://iberisoft.github.io/XPacs.doc) and some other backend platforms.

## Prerequisites

* [Node.js](https://nodejs.org)

## Dependencies

Add the project dependencies:

`npm install`

## Running

Run the development service:

`npm run serve`

## Deployment

Build for production in the `dist` folder:

`npm run build`

Run the production service:

`serve -s dist`

Note that `serve` must be installed by:

`npm install -g serve`

## Simple Storage

This is a simple backend service used by XView and developed for demonstration purposes.

### Dependencies

Add the project dependencies (change the current directory to `simple-storage`):

`npm install`

### Running

Run the service  (change the current directory to `simple-storage`):

`npm run start`
