package com.mizzen.safetosend
import com.google.firebase.FirebaseApp
import com.google.firebase.appcheck.FirebaseAppCheck
import com.google.firebase.appcheck.recaptcha.RecaptchaAppCheckProviderFactory
/** Native Android Enterprise Preview, not web attestation or Play Integrity. No tokenless fallback. */
internal fun installAttestation(app: FirebaseApp) {
 if (BuildConfig.RECAPTCHA_ANDROID_SITE_KEY.isBlank()) return // cloud dispatch explicitly refuses absent provider
 FirebaseAppCheck.getInstance(app).installAppCheckProviderFactory(RecaptchaAppCheckProviderFactory.getInstance(BuildConfig.RECAPTCHA_ANDROID_SITE_KEY))
}
internal fun cloudAttestationConfigured() = BuildConfig.RECAPTCHA_ANDROID_SITE_KEY.isNotBlank()
