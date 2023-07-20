import path from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";

const USER_NUM = 1000;
const FOLLOWER_NUM = 100;

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

const getRandomUserId = () => getRandomInt(1, USER_NUM + 1);

const filename = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "database.db"
);
const db = new sqlite3.Database(filename);
db.serialize(() => {
  for (let i = 1; i <= USER_NUM; i++) {
    const name = Math.random().toString(32).substring(2);
    const parentId = getRandomInt(0, 2) ? getRandomUserId() : null;
    db.run("INSERT INTO user (name, parent_id) VALUES (?, ?)", name, parentId);
  }
});

db.serialize(() => {
  for (let i = 1; i <= FOLLOWER_NUM; i++) {
    const followeeId = getRandomUserId();
    const followerId = getRandomUserId();
    db.run(
      "INSERT INTO follower (followee_id, follower_id) VALUES (?, ?)",
      followeeId,
      followerId
    );
  }
});
