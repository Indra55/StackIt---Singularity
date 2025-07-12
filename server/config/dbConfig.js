require("dotenv").config()

const {Pool} = require("pg")

const connectionString = "postgresql://odoo_db_xya9_user:dJOYBcGBRmIzIVpoJrCdzwGiJ7LHEJ0b@dpg-d1ou2fs9c44c73815ii0-a.singapore-postgres.render.com/odoo_db_xya9"

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
})

module.exports = pool