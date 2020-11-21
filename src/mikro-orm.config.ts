import { __prod__ } from "./constants";
import { Book } from "./entities/book";
import { User } from "./entities/User";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/
    },
    entities: [Book, User],
    dbName: "bookmarker",
    user: "postgres",
    password: "saadmin@123",
    type: "postgresql",
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
