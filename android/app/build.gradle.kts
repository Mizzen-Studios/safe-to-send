import java.util.Properties
plugins { id("com.android.application"); id("org.jetbrains.kotlin.android"); id("org.jetbrains.kotlin.plugin.compose") }
val privateConfig = Properties().apply { rootProject.file("private.properties").takeIf { it.exists() }?.inputStream()?.use { load(it) } }
fun privateValue(name: String) = "\"" + (privateConfig.getProperty(name) ?: "").replace("\\", "\\\\").replace("\"", "\\\"") + "\""
android {
 namespace = "com.mizzen.safetosend"
 compileSdk = 36
 defaultConfig {
  applicationId = "com.mizzen.safetosend"; minSdk = 26; targetSdk = 36; versionCode = 1; versionName = "0.1.0"
  testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
  buildConfigField("String", "FIREBASE_APP_ID", privateValue("firebase.appId"))
  buildConfigField("String", "FIREBASE_API_KEY", privateValue("firebase.apiKey"))
 }
 buildTypes { release { isMinifyEnabled = false } }
 buildFeatures { compose = true; buildConfig = true }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
 kotlinOptions { jvmTarget = "17" }
 packaging { resources.excludes += "/META-INF/{AL2.0,LGPL2.1}" }
}
dependencies {
 implementation(platform("androidx.compose:compose-bom:2025.11.01"))
 implementation("androidx.activity:activity-compose:1.11.0")
 implementation("androidx.compose.material3:material3")
 implementation("androidx.compose.ui:ui-tooling-preview")
 implementation("androidx.core:core-ktx:1.17.0")
 implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.9.4")
 implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
 implementation("com.google.firebase:firebase-ai:18.2.0")
 implementation("com.google.firebase:firebase-ai-ondevice:16.0.0-beta08")
 debugImplementation("com.google.firebase:firebase-appcheck-debug:20.1.0")
 releaseImplementation("com.google.firebase:firebase-appcheck-playintegrity:20.0.2")
 testImplementation("junit:junit:4.13.2")
 androidTestImplementation(platform("androidx.compose:compose-bom:2025.11.01"))
 androidTestImplementation("androidx.compose.ui:ui-test-junit4")
 androidTestImplementation("androidx.test.ext:junit:1.3.0")
 androidTestImplementation("androidx.test:runner:1.7.0")
 debugImplementation("androidx.compose.ui:ui-test-manifest")
}
