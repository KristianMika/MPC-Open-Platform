package cz.muni.fi.mpcop

import io.vertx.core.Launcher


/**
 * The MPCOP entrypoint - launches the deployer verticle
 */
fun main() {
    Launcher.main(arrayOf("run", DeployerVerticle::class.java.name))
}
