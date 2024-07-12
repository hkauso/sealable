# 🦭 Sealable

Reference markdown pastebin using [`pastemd`](https://github.com/hkauso/pastemd).

## Configuration

Sealable supports the following configuration options through environment variables:

* `SITE_NAME` - the name of the site
* `INFO_URL` - the url (relative to root `/`) that will be served from the "what" link in the footer
  * Link is not shown in the footer if this variable is not set
* `USE_STARSTRAW` - if [starstraw](https://github.com/hkauso/starstraw) authentication should be enabled
  * User authentication is completely disabled if this is not provided
  * When provided, views switch from [`OpenMultiple`](https://docs.rs/pastemd/latest/pastemd/database/enum.ViewMode.html#variant.OpenMultiple), to [`AuthenticatedOnce`](https://docs.rs/pastemd/latest/pastemd/database/enum.ViewMode.html#variant.AuthenticatedOnce)

The following configuration options are required for all database types (besides sqlite):

* `DB_TYPE` - the type of the database (`mysql` or `postgres`)
* `DB_HOST` - the database host location (likely `localhost`)
* `DB_USER` - database username
* `DB_PASS` - database password
* `DB_NAME` - database name

## Pongo

It is recommended that you pull the Pongo source into a different directory, build the CSS, and then link it into `static/pongo`.

```bash
ln -s PATH_TO_PONGO/static static/pongo
```

Then you can set the `PO_STATIC_DIR` variable:

```ini
PO_STATIC_DIR="/static/pongo"
```

Pongo is needed for database management.
