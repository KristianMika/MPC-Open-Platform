# Script for updating the PCSCLITE_MAX_READERS_CONTEXTS macro in a PSCS-lite Debian package

PCSC-lite is an implementation of the PC/SC international standard for PC to smartcard reader communication. It contains a PCSCLITE_MAX_READERS_CONTEXTS macro that limits the maximum number of readers connencted to a PC at a time. This script downloads and extracts the PCSC-lite and ccid Debian packages, modifies the macro and builds new packages.

For more info click here: [PCSC-lite](https://pcsclite.apdu.fr/).