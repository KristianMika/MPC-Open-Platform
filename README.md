# Open Platform for Multiparty Signatures with Smartcards
[![MPCOP CI/CD](https://github.com/KristianMika/MPC-Open-Platform/actions/workflows/mpcop.yaml/badge.svg)](https://github.com/KristianMika/MPC-Open-Platform/actions/workflows/mpcop.yaml)

This project aims to create an open platform that uses sets of smartcards connected to a Raspberry Pi and allows execution of several Secure Multiparty Computation protocols. 

## Features

* it provides environment and tools for installation of MPC architectures such as [Myst](https://backdoortolerance.org/) or [Smart-ID RSA](https://research.cyber.ee/~peeter/research/esorics2017.pdf)
* users can control specific nodes from a browser client.

## Architecture 

An MPC node consists of:
* a Raspbian OS (or any Debian-based OS)
* MPC protocols that implement the MPC Open Platform interface
* a HTTP server with websockets that allows users to control nodes.
* Connected smartcards that perform computations

<div style="text-align:center">

![MPC Open Platform architecture](.github/images/MPCNodeScheme.png)

</div>

## Global view
A network of MPC nodes can be used as a single node.

<div style="text-align:center">

![Network of MPC nodes](.github/images/MPCOPNetwork.png)

</div>

## Installation

1. Set up the MPCOP repository on your system:
    - Using the script provided by [packagecloud.io](https://packagecloud.io/)
    ```bash
    curl -s https://packagecloud.io/install/repositories/kristian_mika/mpcop/script.deb.sh | sudo bash
    ```
    - or by direct apt sources modification
    ```bash
    echo "deb https://packagecloud.io/kristian_mika/mpcop/any/ any main" | sudo tee --append /etc/apt/sources.list.d/kristian_mika_mpcop.list
    echo "deb-src https://packagecloud.io/kristian_mika/mpcop/any/ any main" | sudo tee --append /etc/apt/sources.list.d/kristian_mika_mpcop.list
    curl -L "https://packagecloud.io/kristian_mika/mpcop/gpgkey" 2> /dev/null | sudo apt-key add -
    ```
2. Update your package indices
    ```bash
    sudo apt-get update
    ```
3. Install MPCOP
    ```bash
    sudo apt-get install mpcop
    ```
4. After the installation has been completed, the application is running and ready to use on port 8083.

## Run Using Docker

```bash
docker pull mpcop/mpcop:latest
docker run --device /dev/bus/usb -p 8082:8082 -p 8083:8083 mpcop/mpcop:latest
```
## Package

We encourage you to use the prepared pipeline that builds the package for you.

### Package Locally

1. Build the frontend server
    ```bash
    cd mpcop-web
    npm install # to install dependencies
    npm build
    ```
    Static files of the server are in the `mpcop-web/build` folder.
2. Build the app
    ```bash
    cp mpcop-web/build/* mpcop/static/ # copy static files
    git submodule update --init --recursive # clone submodules
    mk-build-deps --install --tool 'apt-get --assume-yes' --root sudo --remove # install build dependencies
    dpkg-buildpackage -b -us -uc # create a package
    ```

There might be a convenience script for local packaging in the future (TODO).

## Development

To test your changes, you can take advantage of the React development server by running
```bash
npm start
```
The development server runs by default on [localhost:3000](localhost:3000).

To run the backend, type
```bash
gradle run
``` 


## Script to Compile PCSC

PCSC-lite is an implementation of the PC/SC international standard for PC to smartcard reader communication. It contains a PCSCLITE_MAX_READERS_CONTEXTS macro that limits the maximum number of readers connencted to a PC at a time. This script downloads and extracts the PCSC-lite and ccid Debian packages, modifies the macro and builds new packages.

For more info click here: [PCSC-lite](https://pcsclite.apdu.fr/).

### How to Build

The provided script is intended to be executed in a Docker container, but you can also run it directly on your host machine. In that case, don't forget to install required packages from the Docker file.


#### Docer Build

1. Build a docker image
    ```bash
    cd pcsc-build
    docker build --tag mpcop/pcsc-build .
    ```

2. Run the built image
    ```bash
    # create a new folder for the build packages
    mkdir release
    docker run -it --rm -v `pwd`/release:/release mpcop/pcsc-build
    ```

3. Now the `./release` folder contains all the required pcsc packages. Install them using
    ```bash
    cd release
    sudo apt install ./*
    ```
