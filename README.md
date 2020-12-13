# Open Platform for Multiparty Signatures with Smartcards
[![Build Status](https://travis-ci.org/KristianMika/MPC-Open-Platform.svg?branch=main)](https://travis-ci.org/KristianMika/MPC-Open-Platform)

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
