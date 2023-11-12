# PaperMC Docker Images

This project is designed to autonomously generate Docker images for each version of PaperMC using GitHub Actions.
It accomplishes this by automatically pushing the images to both Docker Hub and GitHub.

## Why?

Because I was tired of managing multiple Java installations for different server versions.
As an added bonus, this allows me to incorporate a particular server installation into other Minecraft related projects for reference.

## Version Format

Image versioning follows this pattern:
```
# targeting as specific minecraft version and paper build
papermc:<mc_version>-<paper_build>
    
# targeting as specific minecraft version and the latest paper build
papermc:<mc_version>
```

``<mc_version>`` is the Minecraft version you are targeting and ``<paper_build>`` is your desired PaperMC build.

For convenience, you can also specify just the Minecraft version.
The container will then use the latest PaperMC build for that particular version of Minecraft.

## Running the Image 

Below are some examples for running the image.

Minecraft 1.17 using Java 16 on PaperMC build 79:
```
docker run -it papermc:1.17-79
```

Minecraft 1.20.2 using Java 17 on PaperMC build 290:
```
docker run -it papermc:1.20.2-290
```

## License

Distributed under the GNU GPL v3.0 License.
See ``LICENSE`` for more information.