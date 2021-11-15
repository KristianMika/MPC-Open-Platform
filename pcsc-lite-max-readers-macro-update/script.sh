#!/bin/bash

# This script is based on the script written by Jeppe Christiansen: github.com/jeppech

set -e

if [[ $EUID != 0 ]]; then
    echo "Please, run as root"
    exit 1
fi

# dch requires a DEBEMAIL variable to be set
export DEBEMAIL="mpcop_build_script@mockemail.com"
export DEBIAN_FRONTEND=noninteractive

# target readers limit
READER_NUM=60

PCSC_SOURCE="pcsc-lite"
PCSC_LIB="libpcsclite1"
PCSC_LIB_DEV="libpcsclite-dev"
PCSC_VERSION=${PCSC_VERSION:-"1.9.1"}
PCSC_REV="1"
PCSC_SLUG="${PCSC_SOURCE}_${PCSC_VERSION}"
PCSC_SLUG_REV="${PCSC_SLUG}-${PCSC_REV}"
PCSC_DIR="${PCSC_SOURCE}-${PCSC_VERSION}"

P_PCSC_LIB_DEV="${PCSC_LIB_DEV}"

echo "Fetching PCSC sources:"
# PCSC Debian packaging files
wget "http://deb.debian.org/debian/pool/main/p/${PCSC_SOURCE}/${PCSC_SLUG_REV}.debian.tar.xz"
# PCSC source codes
wget "http://deb.debian.org/debian/pool/main/p/${PCSC_SOURCE}/${PCSC_SLUG}.orig.tar.bz2"

echo "Extracting sources"
tar xvf "${PCSC_SLUG_REV}.debian.tar.xz"
tar xjvf "${PCSC_SLUG}.orig.tar.bz2"

echo "Moving Debian folder to the source directory"
mv debian "${PCSC_DIR}/"

# Change reader contexts
echo "Modifying the soruce code"
PCSC_PATCH_FILE=${PCSC_DIR}/src/PCSC/pcsclite.h.in
PCSC_FIND="\#define PCSCLITE_MAX_READERS_CONTEXTS\W+?16"
PCSC_REPLACE="#define PCSCLITE_MAX_READERS_CONTEXTS ${READER_NUM}"

sed -i -E "s/${PCSC_FIND}/${PCSC_REPLACE}/g" "${PCSC_PATCH_FILE}"

# Build the pcscd package
cd "${PCSC_DIR}"

# create a new version
dch --distribution unstable --increment "feat: modify MAX_READS_COUNT to ${READER_NUM}"

echo "Installing dependencies for ${PCSC_SOURCE}"
mk-build-deps --install --tool 'apt-get --assume-yes' --remove

echo "Building the PCSC package"
dpkg-buildpackage -b -rfakeroot -us -uc
cd ..

mkdir -p /release
rm -rf ./*dbgsym*
mv ./*.deb /release
rm -rf ./pcsc-lite*

echo "PCSC has been successfully built"

CCID_NAME="ccid"
CCID_VERSION=${CCID_VERSION:-"1.4.34"}
CCID_REV="1"
CCID_SLUG="${CCID_NAME}_${CCID_VERSION}"
CCID_SLUG_REV="${CCID_SLUG}-${CCID_REV}"
CCID_DIR="${CCID_NAME}-${CCID_VERSION}"

echo "Fetching libccid sources"
# libccid Debian packaging files
wget "http://deb.debian.org/debian/pool/main/c/${CCID_NAME}/${CCID_SLUG_REV}.debian.tar.xz"
# libccid source codes
wget "http://deb.debian.org/debian/pool/main/c/${CCID_NAME}/${CCID_SLUG}.orig.tar.bz2"

echo "Extracting sources"
tar xvf "${CCID_SLUG_REV}.debian.tar.xz"
tar xjvf "${CCID_SLUG}.orig.tar.bz2"

echo "Moving Debian folder to the source directory"
mv debian "${CCID_DIR}/"

# Change reader contexts
echo "Modifying the soruce code"
CCID_PATCH_FILE="${CCID_DIR}/src/ccid_ifdhandler.h"
CCID_FIND="CCID_DRIVER_MAX_READERS\W+?16"
CCID_REPLACE="CCID_DRIVER_MAX_READERS ${READER_NUM}"
sed -i -E "s/${CCID_FIND}/${CCID_REPLACE}/g" "${CCID_PATCH_FILE}"

cd "${CCID_DIR}"

# create a new version
dch --distribution unstable --increment "feat: modify MAX_READS_COUNT to ${READER_NUM}"

echo "Installing built PCSC packages as build dependencies for libccid"
MODIFIED_PCSCLITE_PATH=$(find /release -type f -name "${PCSC_LIB}*.deb")
MODIFIED_PCSCLITE_DEV_PATH=$(find /release -type f -name "${P_PCSC_LIB_DEV}*.deb")
dpkg -i --force-overwrite "${MODIFIED_PCSCLITE_PATH}"
dpkg -i "${MODIFIED_PCSCLITE_DEV_PATH}"

echo "Installing the remaining build dependencies for ${CCID_NAME}"
mk-build-deps --install --tool 'apt-get --assume-yes' --remove

echo "Building the ${CCID_NAME} package"
dpkg-buildpackage -b -rfakeroot -us -uc

cd ..

rm -f ./*dbgsym*
mv ./*.deb /release
rm -rf ./ccid*

echo "Build has finished successfully! Your packages are located in the /release folder."
