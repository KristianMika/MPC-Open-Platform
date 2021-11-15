FROM debian:bullseye

RUN apt-get update && apt-get install --assume-yes \
    wget \
    xz-utils \
    bzip2 \
    devscripts \
    equivs

COPY ./script.sh /

ENV DEBIAN_FRONTEND=noninteractive

ENV PCSC_VERSION="1.9.1"
ENV CCID_VERSION="1.4.34"


ENTRYPOINT bash /script.sh
