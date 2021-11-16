# JavaCard Template project with Gradle

This is a simple ping applet that has been built for performance testing. It containes a singe method `ping`, that returns a word `ping` and some additional padding. This project is based on the [JavaCard Template project with Gradle](https://github.com/ph4r05/javacard-gradle-template)

## Building cap

- Run the `buildJavaCard` task:

```bash
./gradlew buildJavaCard  --info --rerun-tasks
```

Generates a new cap file `./applet/out/cap/applet.cap`

Note: `--rerun-tasks` is to force re-run the task even though the cached input/output seems to be up to date.

## Installation on a card

```bash
./gradlew installJavaCard
```

Or inspect already installed applets:

```bash
./gradlew listJavaCard
```

## Running tests

```
./gradlew test --info --rerun-tasks
```

## Dependencies

This project uses mainly:

- https://github.com/bertrandmartel/javacard-gradle-plugin
- https://github.com/martinpaljak/ant-javacard
- https://github.com/martinpaljak/oracle_javacard_sdks
- https://github.com/licel/jcardsim
- Petr Svenda scripts 

Kudos for a great work!
