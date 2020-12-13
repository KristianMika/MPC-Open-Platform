#!/bin/bash

# The original version of this script was written by Jeppe Christiansen: github.com/jeppech

set -e

if [[ $EUID != 0 ]]; then
	echo "Please, run as root"
    exit 1
fi

echo "Installing dependencies"
apt-get install --assume-yes \
                libudev-dev \
                flex \
                libsystemd-dev \
                debhelper \
                flex \
                libtool \
                libusb-1.0-0-dev \
                pkg-config \
                fakeroot


PCSC_PREFIX="flex" 
READER_NUM=60 
DEB_CONTROL="debian/control" 

PCSC_SOURCE="pcsc-lite" 
PCSC_PACKAGE="pcscd" 
PCSC_LIB="libpcsclite1" 
PCSC_LIB_DEV="libpcsclite-dev" 
PCSC_VERSION="1.8.24" 
PCSC_REV="1" 
PCSC_SLUG="${PCSC_SOURCE}_${PCSC_VERSION}" 
PCSC_SLUG_REV="${PCSC_SLUG}-${PCSC_REV}" 
PCSC_DIR="${PCSC_SOURCE}-${PCSC_VERSION}" 

P_PCSC_PACKAGE="${PCSC_PREFIX}-${PCSC_PACKAGE}" 
P_PCSC_LIB="${PCSC_PREFIX}-${PCSC_LIB}" 
P_PCSC_LIB_DEV="${PCSC_PREFIX}-${PCSC_LIB_DEV}" 

arch=$(dpkg --print-architecture) 
PCSC_VER_ARCH="${PCSC_VERSION}-${PCSC_REV}_${arch}" 
PCSC_FILE="${P_PCSC_PACKAGE}_${PCSC_VER_ARCH}.deb" 
PCSC_LIB_FILE="${P_PCSC_LIB}_${PCSC_VER_ARCH}.deb" 
PCSC_LIB_DEV_FILE="${P_PCSC_LIB_DEV}_${PCSC_VER_ARCH}.deb" 

# Fetch pcscd sources
wget http://deb.debian.org/debian/pool/main/p/${PCSC_SOURCE}/${PCSC_SLUG_REV}.debian.tar.xz 
wget http://deb.debian.org/debian/pool/main/p/${PCSC_SOURCE}/${PCSC_SLUG}.orig.tar.bz2 

# Extract sources, and move `DEBIAN` control folder, to source folder
tar xvf ${PCSC_SLUG_REV}.debian.tar.xz 
tar xjvf ${PCSC_SLUG}.orig.tar.bz2 
# Rename install files, to match new package name
mv debian/${PCSC_LIB_DEV}.examples debian/${P_PCSC_LIB_DEV}.examples 
mv debian/${PCSC_LIB_DEV}.install debian/${P_PCSC_LIB_DEV}.install 
mv debian/${PCSC_LIB_DEV}.manpages debian/${P_PCSC_LIB_DEV}.manpages 
mv debian/${PCSC_LIB_DEV}.symbols debian/${P_PCSC_LIB_DEV}.symbols 
mv debian/${PCSC_LIB}.install debian/${P_PCSC_LIB}.install 
mv debian/${PCSC_LIB}.symbols debian/${P_PCSC_LIB}.symbols 
mv debian/${PCSC_PACKAGE}.docs debian/${P_PCSC_PACKAGE}.docs 
mv debian/${PCSC_PACKAGE}.init debian/${P_PCSC_PACKAGE}.init 
mv debian/${PCSC_PACKAGE}.install debian/${P_PCSC_PACKAGE}.install 
mv debian/${PCSC_PACKAGE}.manpages debian/${P_PCSC_PACKAGE}.manpages 

# Rename the package
sed -i -E "s/pcscd/${PCSC_PREFIX}-pcscd/g" ${DEB_CONTROL} 
sed -i -E "s/libpcsclite1/${PCSC_PREFIX}-libpcsclite1/g" ${DEB_CONTROL} 
sed -i -E "s/libpcsclite-dev/${PCSC_PREFIX}-libpcsclite-dev/g" ${DEB_CONTROL} 

mv debian ${PCSC_DIR}/ 

# Change reader contexts
PCSC_PATCH_FILE=${PCSC_DIR}/src/PCSC/pcsclite.h.in 
PCSC_FIND="\#define PCSCLITE_MAX_READERS_CONTEXTS\W+?16" 
PCSC_REPLACE="#define PCSCLITE_MAX_READERS_CONTEXTS ${READER_NUM}" 

sed -i -E "s/${PCSC_FIND}/${PCSC_REPLACE}/g" ${PCSC_PATCH_FILE} 

# Build the pcscd package
cd ${PCSC_DIR} 
echo "Building the PCSC package"
dpkg-buildpackage -b -rfakeroot -us -uc  
cd .. 

mkdir -p /release 
mv *.deb /release 

rm -rf ./flex* ./pcsc-lite_* 

CCID_NAME="ccid" 
CCID_VERSION="1.4.30" 
CCID_REV="1" 
CCID_SLUG="${CCID_NAME}_${CCID_VERSION}" 
CCID_SLUG_REV="${CCID_SLUG}-${CCID_REV}" 
CCID_DIR="${CCID_NAME}-${CCID_VERSION}" 

CCID_VER_ARCH="${CCID_VERSION}-${CCID_REV}_${arch}" 


echo "Fetching libccid sources"
wget http://deb.debian.org/debian/pool/main/c/${CCID_NAME}/${CCID_SLUG_REV}.debian.tar.xz 
wget http://deb.debian.org/debian/pool/main/c/${CCID_NAME}/${CCID_SLUG}.orig.tar.bz2 

echo "Extracting sources"
tar xvf ${CCID_SLUG_REV}.debian.tar.xz 
tar xjvf ${CCID_SLUG}.orig.tar.bz2 
sed -i -E 's/debian\/libccid/debian\/flex-libccid/g' debian/rules 
sed -i -E 's/libccid/flex-libccid/g' debian/control 
sed -i -E 's/libpcsclite-dev/flex-libpcsclite-dev/g' debian/control 
mv debian ${CCID_DIR}/ 

# Change reader contexts from 16 to 36
CCID_PATCH_FILE="${CCID_DIR}/src/ccid_ifdhandler.h" 
CCID_FIND="CCID_DRIVER_MAX_READERS\W+?16" 
CCID_REPLACE="CCID_DRIVER_MAX_READERS ${READER_NUM}" 
sed -i -E "s/${CCID_FIND}/${CCID_REPLACE}/g" ${CCID_PATCH_FILE} 

echo "Installing build dependencies"
dpkg -i --force-overwrite "/release/${PCSC_LIB_FILE}" 
dpkg -i "/release/${PCSC_LIB_DEV_FILE}" 
cd ${CCID_DIR} 
dpkg-buildpackage -b -rfakeroot -us -uc  
cd .. 
mv *.deb /release 
rm -rf ./flex* ./ccid_* 
rm -f /release/*dbgsym*

echo "Build has finished successfully! Your packages are located in the /release folder."
