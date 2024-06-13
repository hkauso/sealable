# 🦭 Sealable

Reference markdown pastebin using [`pastemd`](https://github.com/hkauso/pastemd).

## Configuration

Sealable supports the following configuration options through environment variables:

* `SITE_NAME` - the name of the site
* `INFO_URL` - the url (relative to root `/`) that will be served from the "what" link in the footer
  * Link is not shown in the footer if this variable is not set

The following configuration options are required for all database types (besides sqlite):

* `DB_TYPE` - the type of the database (`mysql` or `postgres`)
* `DB_HOST` - the database host location (likely `localhost`)
* `DB_USER` - database username
* `DB_PASS` - database password
* `DB_NAME` - database name
