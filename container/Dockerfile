ARG ARCH=
ARG JAVA_VERSION=17
FROM ${ARCH}eclipse-temurin:${JAVA_VERSION}

# create server user
RUN useradd -m -d /server -s /bin/bash paper
USER paper
WORKDIR /server

# download server & accept eula
ARG PAPER_VERSION=1.20.2
ARG PAPER_BUILD=280
RUN curl -L -o /server/server.jar https://api.papermc.io/v2/projects/paper/versions/$PAPER_VERSION/builds/$PAPER_BUILD/downloads/paper-$PAPER_VERSION-$PAPER_BUILD.jar && \
    echo "eula=true" > /server/eula.txt

# run server
ENV JAVA_ARGS=""
ENV SERVER_ARGS=""
CMD java $JAVA_ARGS -jar server.jar $SERVER_ARGS