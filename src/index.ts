import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Book } from "./entities/book";
import microConfig from "./mikro-orm.config";

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();
    // const book = orm.em.create(Book, {title: 'The Alchemist'});
    // await orm.em.persistAndFlush(book);

    const books = await orm.em.find(Book, {});
    console.log(books);
}

main().catch(err => {
    console.error(err)
});