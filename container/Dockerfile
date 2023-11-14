ARG ARCH=
ARG JAVA_VERSION=17
FROM ${ARCH}eclipse-temurin:${JAVA_VERSION}

# create server user
RUN useradd -m -d /server -s /bin/bash paper && \
    mkdir -p /game
WORKDIR /server

# download server & accept eula
ARG PAPER_VERSION=1.20.2
ARG PAPER_BUILD=280
RUN curl -L -o /game/server.jar https://api.papermc.io/v2/projects/paper/versions/$PAPER_VERSION/builds/$PAPER_BUILD/downloads/paper-$PAPER_VERSION-$PAPER_BUILD.jar

# run server
ENV JAVA_ARGS=""
ENV SERVER_ARGS=""
CMD chown -R paper:paper /server && \
    chown -R paper:paper /game && \
    su - paper -c "echo 'eula=true' > ./eula.txt" && \
    su - paper -c "exec /opt/java/openjdk/bin/java $JAVA_ARGS -jar /game/server.jar $SERVER_ARGS"