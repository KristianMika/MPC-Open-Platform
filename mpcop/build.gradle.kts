import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    // Apply the org.jetbrains.kotlin.jvm Plugin to add support for Kotlin.
    id("org.jetbrains.kotlin.jvm") version "1.5.0"
    // Apply the application plugin to add support for building a CLI application in Java.
    application
    java
}

repositories {
    mavenCentral()

    // TODO: somehow add repositories from nested build.gradle files
    // Repositories stolen from the smart-id rsa build.gradle
    // Repository with JCardSim, Globalplatform, etc, ...
    maven(url = "https://dl.bintray.com/ph4r05/jcard")

    maven(url = "https://javacard.pro/maven")

    maven(url = "https://deadcode.me/mvn")
}

dependencies {
    // Align versions of all Kotlin components
    implementation(platform("org.jetbrains.kotlin:kotlin-bom"))

    // Use the Kotlin JDK 8 standard library.
    implementation(kotlin("stdlib-jdk8"))

    // Gson
    implementation("com.google.code.gson:gson:2.8.8")

    // Vert.x
    val vertxVersion = "4.1.4"

    // https://mvnrepository.com/artifact/io.vertx/vertx-core
    implementation("io.vertx:vertx-core:$vertxVersion")

    // https://mvnrepository.com/artifact/io.vertx/vertx-web
    implementation("io.vertx:vertx-web:$vertxVersion")

    // https://mvnrepository.com/artifact/io.vertx/vertx-web-templ-handlebars
    implementation("io.vertx:vertx-web-templ-handlebars:$vertxVersion")

    // Protocols
    implementation(project(":MPCTestClient"))
    implementation(project(":MPCApplet"))

    implementation(project(":javacard-smpc-rsa"))

    // https://mvnrepository.com/artifact/org.bouncycastle/bcprov-jdk15on
    implementation("org.bouncycastle:bcprov-jdk15on:1.69")

    implementation("com.klinec:jcardsim:3.0.5.11")

    implementation("io.vertx:vertx-lang-kotlin-coroutines:$vertxVersion")

    implementation("io.vertx:vertx-lang-kotlin:$vertxVersion")

    testImplementation("io.vertx:vertx-junit5:$vertxVersion")
}

application {
    // Define the main class for the application.
    mainClass.set("cz.muni.fi.mpcop.MpcopKt")
    applicationDefaultJvmArgs = listOf("-noverify")
}

configure<JavaPluginConvention> {
    sourceCompatibility = JavaVersion.VERSION_1_8
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = JavaVersion.VERSION_1_8.toString() //"1.8"
}

tasks.withType<Test> {
    useJUnitPlatform()

}

tasks.withType<Wrapper> {
    gradleVersion = "7.2"
}