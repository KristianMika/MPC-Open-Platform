FROM ubuntu:latest

ARG APP_PORT=8082
ARG WEBSITE_PORT=8083
ARG BUILD_DATE
ARG VCS_REF
ARG BUILD_VERSION

LABEL org.label-schema.version="1.0"
LABEL org.label-schema.build-date=${BUILD_DATE}
LABEL org.label-schema.name="mpcop/mpcop"
LABEL org.label-schema.description="Open Platform for Multiparty Signatures with Smartcards"
LABEL org.label-schema.url = "https://github.com/KristianMika/MPC-Open-Platform"
LABEL org.label-schema.vcs-ref=${VCS_REF}
LABEL org.label-schema.version=${BUILD_VERSION}
LABEL org.label-schema.docker.cmd="docker run --device /dev/bus/usb -p ${APP_PORT}:${APP_PORT} -p ${WEBSITE_PORT}:${WEBSITE_PORT} mpcop/mpcop"

COPY mpcop_*.deb /

RUN apt-get update && apt-get install --assume-yes /mpcop_*.deb
RUN rm /mpcop_*.deb

EXPOSE ${APP_PORT}
EXPOSE ${WEBSITE_PORT}

ENTRYPOINT service pcscd start && java -noverify -jar /www/mpcop/bin/mpcop.jar
