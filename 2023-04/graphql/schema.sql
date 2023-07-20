CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parent_id INTEGER,

  UNIQUE(name)
);

CREATE TABLE follower (
  followee_id INTEGER NOT NULL,
  follower_id INTEGER NOT NULL,
  PRIMARY KEY(followee_id, follower_id)
);
