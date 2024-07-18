import { bootstrap } from '../src/app.js';
import { initORM } from '../src/db.js';

export async function initTestApp(port: number) {
  // this will create all the ORM services and cache them
  const db = await initORM({
    // no need for debug information, it would only pollute the logs
    debug: false,
    // we will use a dynamic name, based on port. This way we can easily parallelize our tests
    dbName: `blog_test_${port}`,
    // create the database if it doesn't already exist
    ensureDatabase: { create: false },
    // required for the migrations
    multipleStatements: true,
    dynamicImportProvider: (id) => import(id),
  });

  try {
    const { app } = await bootstrap(port);

    return app;
  } catch (e: unknown) {
    await db.orm.schema.dropDatabase();
    throw e;
  }
}
