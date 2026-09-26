import { readFile } from "node:fs/promises";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { get, ref, set, update } from "firebase/database";

const projectId = "demo-game-dle";
const rules = await readFile(
  new URL("../database.rules.json", import.meta.url),
  "utf8"
);
const testEnvironment = await initializeTestEnvironment({
  projectId,
  database: { rules },
});

const tests = [];
const test = (name, run) => tests.push({ name, run });

const activity = {
  date: "2026-09-26",
  gameId: "wordle",
  won: true,
  attempts: 3,
  completedAt: 1,
};

const room = {
  code: "ABC234",
  hostId: "host",
  status: "waiting",
  round: 0,
  totalRounds: 5,
  letter: "",
  durationMs: 90_000,
  votingDurationMs: 30_000,
  startedAt: null,
  stoppedAt: null,
  votingStartedAt: null,
  votingCursor: 0,
  categories: ["Nombre", "Animal"],
  players: {
    host: { name: "Host", online: true, joinedAt: 1 },
  },
  createdAt: 1,
};

test("bloquea lecturas y escrituras sin autenticación", async () => {
  const database = testEnvironment.unauthenticatedContext().database();
  await assertFails(get(ref(database, "users/host/activity")));
  await assertFails(
    set(ref(database, "users/host/activity/2026-09-26/wordle"), activity)
  );
});

test("una identidad anónima sólo accede a su actividad", async () => {
  const ownDatabase = testEnvironment.authenticatedContext("alice").database();
  await assertSucceeds(
    set(ref(ownDatabase, "users/alice/activity/2026-09-26/wordle"), activity)
  );
  await assertSucceeds(get(ref(ownDatabase, "users/alice/activity")));
  await assertFails(get(ref(ownDatabase, "users/bob/activity")));
  await assertFails(
    set(
      ref(ownDatabase, "users/alice/activity/2026-09-26/wordle/private"),
      "PII"
    )
  );
});

test("valida creación, unión y reconexión de una sala", async () => {
  const hostDatabase = testEnvironment.authenticatedContext("host").database();
  const guestDatabase = testEnvironment
    .authenticatedContext("guest")
    .database();
  await assertSucceeds(set(ref(hostDatabase, "rooms/ABC234"), room));
  await assertSucceeds(get(ref(guestDatabase, "rooms/ABC234")));
  await assertSucceeds(
    set(ref(guestDatabase, "rooms/ABC234/players/guest"), {
      name: "Guest",
      online: true,
      joinedAt: 2,
    })
  );
  await assertSucceeds(
    update(ref(guestDatabase, "rooms/ABC234/players/guest"), {
      name: "Guest reconectado",
      online: true,
    })
  );
  await assertFails(
    update(ref(guestDatabase, "rooms/ABC234/players/host"), { online: false })
  );
  await assertFails(
    set(ref(hostDatabase, "rooms/DEF567"), {
      ...room,
      code: "DEF567",
      privateNote: "no permitido",
    })
  );
});

test("limita respuestas y votos a payloads esperados", async () => {
  const hostDatabase = testEnvironment.authenticatedContext("host").database();
  const guestDatabase = testEnvironment
    .authenticatedContext("guest")
    .database();
  await assertSucceeds(set(ref(hostDatabase, "rooms/ABC234"), room));
  await assertSucceeds(
    set(ref(guestDatabase, "rooms/ABC234/players/guest"), {
      name: "Guest",
      online: true,
      joinedAt: 2,
    })
  );
  await assertSucceeds(
    set(ref(guestDatabase, "rooms/ABC234/answers/guest"), {
      values: { 0: "Ana", 1: "Antílope" },
      submittedAt: 3,
    })
  );
  await assertFails(
    set(ref(guestDatabase, "rooms/ABC234/answers/guest"), {
      values: { 0: "x".repeat(41) },
      submittedAt: 3,
    })
  );
  await assertSucceeds(set(ref(hostDatabase, "rooms/ABC234/status"), "voting"));
  await assertSucceeds(
    set(ref(guestDatabase, "rooms/ABC234/votes/guest/host/0"), "yes")
  );
  await assertFails(
    set(ref(guestDatabase, "rooms/ABC234/votes/guest/host/0"), "maybe")
  );
});

let failed = 0;
try {
  for (const { name, run } of tests) {
    await testEnvironment.clearDatabase();
    try {
      await run();
      console.log(`✓ ${name}`);
    } catch (error) {
      failed += 1;
      console.error(`✗ ${name}`);
      console.error(error);
    }
  }
} finally {
  await testEnvironment.cleanup();
}

if (failed) process.exitCode = 1;
