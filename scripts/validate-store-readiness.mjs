import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const strict = process.argv.includes("--strict");
const errors = [];
const blockers = [];
const notes = [];

const packageJson = readJson("package.json");
const listing = readJson("store/listing.es-AR.json");
const releaseState = readJson("store/release-state.json");
const androidGradle = readText("android/app/build.gradle");
const iosProject = readText("ios/App/App.xcodeproj/project.pbxproj");
const androidManifest = readText("android/app/src/main/AndroidManifest.xml");
const iosInfo = readText("ios/App/App/Info.plist");
const adConfig = readText("src/app/shared/config/admob.config.ts");

check(
  packageJson.version === listing.version,
  "package.json y listing deben usar la misma versión."
);
check(
  packageJson.version === "1.0.0",
  "La primera ficha debe declarar la versión 1.0.0."
);
check(
  androidGradle.includes("?: '1.0.0'"),
  "Android no tiene 1.0.0 como versionName por defecto."
);
check(
  (iosProject.match(/MARKETING_VERSION = 1\.0\.0;/g) ?? []).length === 2,
  "Debug y Release de iOS deben usar MARKETING_VERSION 1.0.0."
);
check(
  androidManifest.includes("android.permission.INTERNET"),
  "Android requiere permiso de Internet."
);
check(
  !androidManifest.includes(
    'uses-permission android:name="com.google.android.gms.permission.AD_ID" />'
  ),
  "Android no debe volver a incluir AD_ID mientras la política indique que no se usa."
);
check(
  iosInfo.includes("<key>ITSAppUsesNonExemptEncryption</key>"),
  "iOS debe declarar el estado de export compliance."
);

checkText(listing.googlePlay.title, 30, "Título de Google Play");
checkText(
  listing.googlePlay.shortDescription,
  80,
  "Descripción corta de Google Play"
);
checkText(
  listing.googlePlay.fullDescription,
  4000,
  "Descripción completa de Google Play"
);
checkText(listing.appStore.name, 30, "Nombre de App Store");
checkText(listing.appStore.subtitle, 30, "Subtítulo de App Store");
checkText(
  listing.appStore.promotionalText,
  170,
  "Texto promocional de App Store"
);
checkText(listing.appStore.description, 4000, "Descripción de App Store");
checkText(listing.appStore.keywords, 100, "Keywords de App Store");
checkText(listing.releaseNotes, 4000, "Notas de versión");

for (const [label, value] of [
  ["Support URL", listing.supportUrl],
  ["Privacy Policy URL", listing.privacyPolicyUrl],
  ["Marketing URL", listing.marketingUrl],
]) {
  check(/^https:\/\//.test(value), `${label} debe usar HTTPS.`);
}
check(
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(listing.supportEmail),
  "El email de soporte no es válido."
);

checkPng("store/assets/google-play/icon.png", 512, 512, {
  maxBytes: 1024 * 1024,
  alpha: true,
});
checkPng("store/assets/google-play/feature-graphic.png", 1024, 500, {
  alpha: false,
});
checkScreenshots("store/assets/google-play/phone/es-AR", 2, 8, [[1080, 1920]]);
checkScreenshots("store/assets/app-store/iphone-6.9/es-AR", 1, 10, [
  [1260, 2736],
  [1290, 2796],
  [1320, 2868],
]);
checkScreenshots("store/assets/app-store/ipad-13/es-AR", 1, 10, [
  [2048, 2732],
  [2064, 2752],
]);

for (const path of [
  "store/README.md",
  "store/privacy-data-map.md",
  "store/content-rating.md",
  "store/release-checklist.md",
  "android/keystore.properties.example",
]) {
  check(existsSync(join(projectRoot, path)), `Falta ${path}.`);
}

const blockerLabels = {
  bundleIdOwnershipConfirmed: "Confirmar la titularidad de com.gamedle.app.",
  contentRightsReviewed:
    "Cerrar la revisión de derechos de contenido y marcas.",
  googlePlayAppCreated: "Crear la aplicación en Play Console.",
  playAppSigningEnabled: "Habilitar Play App Signing.",
  androidUploadKeySecured: "Crear y respaldar el upload key Android.",
  androidInternalTrackPassed: "Aprobar el testing interno de Google Play.",
  appleAppIdCreated: "Registrar el App ID explícito en Apple Developer.",
  appStoreRecordCreated: "Crear la ficha en App Store Connect.",
  appleAgreementsCompleted: "Completar contratos y datos de Apple.",
  testFlightPassed: "Aprobar el ciclo de TestFlight en iPhone/iPad.",
  privacyFormsSubmitted: "Enviar Data safety y App Privacy.",
  contentRatingSubmitted: "Enviar los cuestionarios de clasificación.",
  productionAdUnitsConfigured:
    "Configurar las unidades AdMob reales antes del rollout monetizado.",
  androidRealDeviceQaPassed: "Completar QA en Android real.",
  iosRealDeviceQaPassed: "Completar QA en iPhone/iPad real.",
};
for (const [key, label] of Object.entries(blockerLabels)) {
  if (releaseState[key] !== true) blockers.push(label);
}
if (/ca-app-pub-3940256099942544/.test(adConfig)) {
  blockers.push("Los IDs de AdMob siguen siendo los oficiales de prueba.");
}

if (errors.length) {
  console.error(`Store readiness: ${errors.length} error(es).`);
  errors.forEach((error) => console.error(`  ERROR: ${error}`));
}
if (blockers.length) {
  console.warn(`Store readiness: ${blockers.length} bloqueo(s) externo(s).`);
  [...new Set(blockers)].forEach((blocker) =>
    console.warn(`  PENDIENTE: ${blocker}`)
  );
}
notes.forEach((note) => console.log(`  OK: ${note}`));

if (!errors.length && (!strict || !blockers.length)) {
  console.log(
    strict
      ? "Store readiness estricto completo."
      : "Artefactos de store válidos; los pendientes externos están documentados."
  );
} else {
  process.exitCode = 1;
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function readText(path) {
  const absolute = join(projectRoot, path);
  if (!existsSync(absolute)) {
    errors.push(`Falta ${path}.`);
    return "{}";
  }
  return readFileSync(absolute, "utf8");
}

function check(condition, message) {
  if (!condition) errors.push(message);
}

function checkText(value, maximum, label) {
  check(
    typeof value === "string" && value.trim().length > 0,
    `${label} está vacío.`
  );
  if (typeof value === "string") {
    check(
      value.length <= maximum,
      `${label} supera ${maximum} caracteres (${value.length}).`
    );
    notes.push(`${label}: ${value.length}/${maximum} caracteres.`);
  }
}

function checkScreenshots(path, minimum, maximum, allowedSizes) {
  const absolute = join(projectRoot, path);
  if (!existsSync(absolute)) {
    errors.push(`Falta el directorio de capturas ${path}.`);
    return;
  }
  const files = readdirSync(absolute).filter((file) =>
    file.toLowerCase().endsWith(".png")
  );
  check(
    files.length >= minimum && files.length <= maximum,
    `${path} debe contener entre ${minimum} y ${maximum} PNG; contiene ${files.length}.`
  );
  files.forEach((file) => {
    const info = pngInfo(join(absolute, file));
    check(
      allowedSizes.some(
        ([width, height]) => info.width === width && info.height === height
      ),
      `${path}/${file} tiene ${info.width}×${info.height}.`
    );
    if (path.includes("app-store")) {
      check(
        !info.hasAlpha,
        `${path}/${file} no puede incluir canal alpha para App Store.`
      );
    }
  });
  notes.push(`${path}: ${files.length} capturas.`);
}

function checkPng(path, expectedWidth, expectedHeight, options = {}) {
  const absolute = join(projectRoot, path);
  if (!existsSync(absolute)) {
    errors.push(`Falta ${path}.`);
    return;
  }
  const info = pngInfo(absolute);
  check(
    info.width === expectedWidth && info.height === expectedHeight,
    `${path} debe medir ${expectedWidth}×${expectedHeight}; mide ${info.width}×${info.height}.`
  );
  if (options.alpha === true)
    check(info.hasAlpha, `${path} debe ser PNG de 32 bits con alpha.`);
  if (options.alpha === false)
    check(!info.hasAlpha, `${path} no debe tener canal alpha.`);
  if (options.maxBytes)
    check(
      statSync(absolute).size <= options.maxBytes,
      `${path} supera ${options.maxBytes} bytes.`
    );
  notes.push(`${path}: ${info.width}×${info.height}.`);
}

function pngInfo(path) {
  const buffer = readFileSync(path);
  const signature = "89504e470d0a1a0a";
  if (
    buffer.subarray(0, 8).toString("hex") !== signature ||
    buffer.subarray(12, 16).toString("ascii") !== "IHDR"
  ) {
    errors.push(`${path} no es un PNG válido.`);
    return { width: 0, height: 0, hasAlpha: false };
  }
  const colorType = buffer[25];
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    hasAlpha: colorType === 4 || colorType === 6,
  };
}
