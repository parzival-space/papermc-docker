# PaperMC Docker Images

These are automated builds for Docker images for each specific PaperMC Minecraft server version.
Every day a new image gets build, if there are any new PaperMC build available.

PaperMC is an optimized Minecraft server with plugin support (Bukkit, Spigot, Sponge, etc.).
This image provides a basic PaperMC server. All customizations are left to the user.

## Why?

Because I was tired of managing multiple Java installations for different server versions.
As a bonus, this allows me to incorporate a particular server installation into other Minecraft related projects for reference.

## Usage

You need a working Docker installation.
If that is not the case, go do that and come back once you're done.

### Quick Setup

Using this image, you can create your own PaperMC server with one simple command.
When you run this command, the image auto-accepts the [Minecraft EULA](https://www.minecraft.net/en-us/eula) for you.

```
# if you want to use docker hub
docker run -it -p 25565:25565/tcp -v -/server:/server parzivalspace/papermc:1.20.2

# if you want to use github container registry
docker run -it -p 25565:25565/tcp -v -/server:/server ghcr.io/parzival-space/papermc:1.20.2
```

The command above will run a PaperMC 1.20.2 server using the latest available PaperMC build.
This will most likely be enougth in most cases, but you can customize the image even further.

### Options

Docker provides many command line options that you can use to customize the behavior of this image.
I listed some of them you are most likely to be interested in below:

* <b>Port Forwarding</b> <br>
    You certainly want your server to be accessable at some point.
    The port arguemnt allows you to pass a port from the container to your host machine.

    * ``-p <server_port>:25565/tcp`` - Will pass the games port to ``server_port`` on your host.
    * ``-p <server_port>:25575/tcp`` - Will pass the rcon port to ``server_port`` on your host.

* <b>Volume</b> <br>
    This allows you to make your server storage persistent by mapping a directory in the container to your hosts filesystem.

    * ``-v <directory>:/server`` - ``/server`` is where your server stores the game data in the container.

* <b>Detached</b> <br>
    Allows you to run the container detached from the current shell session. No more ``screen``.

    * ``-d`` - Just include this in you ``run`` command instead of using ``screen``.

* <b>Interactive Session</b> <br>
    Makes the current run session interactive.
    You need this if you want to use the server console.

    * ``-it`` - Makes the session interactive.

* <b>Restart Policy</b> <br>
    Docker has a feature for automatically restarting a container under certain conditions.
    Please read the documentation about [Restart Policies](https://docs.docker.com/engine/reference/run/#restart-policies---restart).
    For convenience I am only mentioning ``on-failure`` here.

    * ``--restart on-failure`` - Will automatically restart the server once it crashed.

* <b>Name</b> <br>
    You shoul name your container to access it later more easily.
    This is especially usefull if you want to run the container detached from the current session.

    * ``--name <container_name>`` - Runs the container under the ``<container_name>`` name.

* <b>Environment Variables</b> <br>
    You can pass envrionment variables to the container.
    This is how you can configure this image.
    More on this topic stands below.

    * ``-e <variable>=<value>`` - Sets the variable ``<variable>`` to ``<value>``.

### Environment Variables

As mentioned above, you can configure this image even further by providing environment variables.
This image currently only accepts 2 variables:

* ``JAVA_ARGS``:<br>
    These are variables that are directly passed to the Java runtime:
    Here you can provide customized launch arguments.

    * ``-e JAVA_ARGS="-Xms=4G -Xmx=4G"`` - This tells the Java runtime to use 4gb of memory.

* ``SERVER_ARGS``:<br>
    This variable sets the arguments that are directly passed to PaperMC.
    To get a full list of available arguments, set this to ``--help``.

    * ``-e SERVER_ARGS="--help"`` - Displays PaperMCs help message.

## Links

Docker Hub: [parzivalspace/papermc](https://hub.docker.com/r/parzivalspace/papermc)

GitHub Package: [ghcr.io/parzival-space/papermc:1.20.2](https://github.com/parzival-space/papermc-docker/pkgs/container/papermc)

GitHub Source: [parzival-space/papermc-docker](https://github.com/parzival-space/papermc-docker)

## License

Distributed under the GNU GPL v3.0 License.
See ``LICENSE`` for more information.