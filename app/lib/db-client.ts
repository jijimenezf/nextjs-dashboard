import { Pool } from 'pg'
//const connectionString = 'postgres://xqyryzbb:m8dPRx1hPZ1vlj34bN_qHj2zHLnvQaUT@batyr.db.elephantsql.com/xqyryzbb';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || '',
    ssl: true,
    max: 1, // set pool max size to 1 Free ElephantSQL databases accept only 1 connection
    idleTimeoutMillis: 3000, // close idle clients after 3 second5
    connectionTimeoutMillis: 6000, // return an error after 6 seconds if connection could not be established
    maxUses: 7500, // close (and replace) a connection after it has been used 7500 times
})

/* const pool2 = new Pool({
    database: 'xqyryzbb',
    user: 'xqyryzbb',
    password: 'm8dPRx1hPZ1vlj34bN_qHj2zHLnvQaUT',
    host: 'batyr.db.elephantsql.com',
    port: 5432,
    ssl: true,
    max: 1, // set pool max size to 20
    idleTimeoutMillis: 5000, // close idle clients after 1 second
    connectionTimeoutMillis: 5000, // return an error after 1 second if connection could not be established
    maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
  }) */

pool.on('error', (err, ctl) => {
    console.error('Unexpected error on idle client', err)
    ctl.release();
    process.exit(-1)
  })
 
export {
    pool,
}
