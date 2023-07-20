import path from "node:path";
import { fileURLToPath } from "node:url";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import typeGraphql from "type-graphql";
const {
  Arg,
  buildSchema,
  createUnionType,
  Field,
  FieldResolver,
  ID,
  Int,
  ObjectType,
  Query,
  Resolver,
  Root,
} = typeGraphql;

const filename = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "database.db"
);
const db = await open({ filename, driver: sqlite3.Database });

@ObjectType()
class Flag {
  @Field()
  flag1: string = process.env.FLAG1!;
}

@ObjectType()
class Dummy {
  @Field()
  flag1: string = "dummy";
}

const FlagUnion = createUnionType({
  name: "FlagUnion",
  types: () => [Flag, Dummy] as const,
});

@Resolver()
class FlagResolver {
  @Query((returns) => FlagUnion)
  async getFlag() {
    return new Flag();
  }
}

@ObjectType()
class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field({ nullable: true })
  startCursor?: string;

  @Field({ nullable: true })
  endCursor?: string;
}

@ObjectType()
class User {
  @Field((type) => ID)
  id: string;

  @Field()
  name: string;

  @Field((type) => ID, { nullable: true })
  parentId?: string;
}

@ObjectType()
class UserEdge {
  @Field((type) => User)
  node: User;

  @Field()
  cursor: string;
}

@ObjectType()
class UserConnection {
  @Field((type) => [UserEdge])
  edges: UserEdge[];

  @Field((type) => [User])
  nodes: User[];

  @Field((type) => PageInfo)
  pageInfo: PageInfo;
}

@Resolver((of) => User)
export class UserResolver {
  @FieldResolver((returns) => User, { nullable: true })
  async parent(@Root() user: User) {
    if (user.parentId === undefined) {
      return null;
    }
    const row = await db.get("SELECT * FROM user WHERE id = ?", user.parentId);
    if (!row) {
      return null;
    }
    return makeUser(row);
  }

  @FieldResolver((returns) => UserConnection)
  async followers(
    @Root() user: User,
    @Arg("first", (returns) => Int) first: number,
    @Arg("after", { nullable: true }) after?: string
  ) {
    const limit = first + 1;
    const offset = getOffsetFromCursor(after);
    const rows = await db.all(
      "SELECT * FROM user WHERE id IN (SELECT follower_id FROM follower WHERE followee_id = ?) LIMIT ? OFFSET ?",
      user.id,
      limit,
      offset
    );
    const users = rows.map(makeUser);
    return makeUserConnection(users, limit, offset);
  }

  @Query((returns) => User, { nullable: true })
  async user(@Arg("id") id: string) {
    const row = await db.get("SELECT * FROM user WHERE id = ?", id);
    if (!row) {
      return null;
    }
    return makeUser(row);
  }

  @Query((returns) => [User])
  async searchUsers(@Arg("name") name: string) {
    const rows = await db.all("SELECT * FROM user WHERE name LIKE ?", name);
    return rows.map(makeUser);
  }

  @Query((returns) => UserConnection, {
    complexity: ({ childComplexity, args }) => args.first * childComplexity,
  })
  async listUsers(
    @Arg("first", (returns) => Int) first: number,
    @Arg("after", { nullable: true }) after?: string
  ) {
    const limit = first + 1;
    const offset = getOffsetFromCursor(after);
    const rows = await db.all(
      "SELECT * FROM user ORDER BY id LIMIT ? OFFSET ?",
      limit,
      offset
    );
    const users = rows.map(makeUser);
    return makeUserConnection(users, limit, offset);
  }
}

export const schema = await buildSchema({
  resolvers: [UserResolver, FlagResolver],
  // emitSchemaFile: true,
});

function makeUser(row: any) {
  const user = new User();
  user.id = row.id;
  user.name = row.name;
  user.parentId = row.parent_id;
  return user;
}

function makeUserConnection(users: User[], limit: number, offset: number) {
  const userConnection = new UserConnection();
  userConnection.nodes = users.slice(0, limit - 1);
  userConnection.edges = userConnection.nodes.map((user, i) => {
    const userEdge = new UserEdge();
    userEdge.cursor = encodeCursor(offset + i);
    userEdge.node = user;
    return userEdge;
  });
  const pageInfo = new PageInfo();
  pageInfo.hasNextPage = limit === users.length;
  pageInfo.hasPreviousPage = offset > 0;
  if (users.length > 0) {
    pageInfo.startCursor = encodeCursor(offset);
    pageInfo.endCursor = encodeCursor(offset + userConnection.nodes.length - 1);
  }
  userConnection.pageInfo = pageInfo;
  return userConnection;
}

function encodeCursor(offset: number) {
  return Buffer.from(String(offset)).toString("base64");
}

function getOffsetFromCursor(cursor?: string) {
  if (cursor === undefined) {
    return 0;
  }
  const offset = Number(Buffer.from(cursor, "base64").toString());
  if (Number.isNaN(offset)) {
    return 0;
  }
  return offset + 1;
}
