import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar

plugins {
    // Apply the org.jetbrains.kotlin.jvm Plugin to add support for Kotlin.
    id("org.jetbrains.kotlin.jvm") version "1.5.0"

    // Add shadowJar task
    id("com.github.johnrengelman.shadow") version "7.0.0"

    // Apply the application plugin to add support for building a CLI application in Java.
    application
}

version = "0.3.0"
group = "cz.muni.fi"
repositories {
    mavenCentral()

    maven(url = "https://dl.bintray.com/ph4r05/jcard")

    maven(url = "https://javacard.pro/maven")

    maven(url = "https://deadcode.me/mvn")
}

dependencies {
    // Align versions of all Kotlin components
    implementation(platform("org.jetbrains.kotlin:kotlin-bom"))

    // Gson
    implementation("com.google.code.gson:gson:2.8.8")

    // Vert.x
    val vertxVersion = "4.1.4"

    // https://mvnrepository.com/artifact/io.vertx/vertx-core
    implementation("io.vertx:vertx-core:$vertxVersion")

    // https://mvnrepository.com/artifact/io.vertx/vertx-web
    implementation("io.vertx:vertx-web:$vertxVersion")

    implementation("io.vertx:vertx-lang-kotlin:$vertxVersion")

    // Protocols
    implementation(project(":MPCTestClient"))

    implementation(project(":javacard-smpc-rsa"))

    // https://mvnrepository.com/artifact/org.bouncycastle/bcprov-jdk15on
    implementation("org.bouncycastle:bcprov-jdk15on:1.69")

    implementation("com.klinec:jcardsim:3.0.5.11")

    // Test dependencies
    testImplementation("io.vertx:vertx-junit5:$vertxVersion")

    implementation("io.vertx:vertx-lang-kotlin-coroutines:$vertxVersion")

    // https://mvnrepository.com/artifact/io.vertx/vertx-unit
    testImplementation("io.vertx:vertx-unit:$vertxVersion")

}

application {
    // Define the main class for the application.
    mainClass.set("cz.muni.fi.mpcop.MpcopKt")

    // Add a JVM switch for JCardSim
    applicationDefaultJvmArgs = listOf("-noverify")
}



configure<JavaPluginConvention> {
    sourceCompatibility = JavaVersion.VERSION_1_8
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = JavaVersion.VERSION_1_8.toString() // "1.8"
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.withType<Wrapper> {
    gradleVersion = "7.2"
}

tasks.withType<ShadowJar>() {
    archiveFileName.set("mpcop.jar")
    manifest {
        attributes["Main-Class"] = "cz.muni.fi.mpcop.MpcopKt"
    }
}
