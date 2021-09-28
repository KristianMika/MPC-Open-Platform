rootProject.name = "mpcop"

include(":MPCApplet", ":MPCTestClient", ":javacard-smpc-rsa")

project(":MPCApplet").projectDir=File(settingsDir, "protocols/Myst/MPCApplet")
project(":MPCTestClient").projectDir=File(settingsDir, "protocols/Myst/MPCTestClient")
project(":javacard-smpc-rsa").projectDir=File(settingsDir, "protocols/javacard-smpc-rsa/applet")
