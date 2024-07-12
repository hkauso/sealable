//! Base values for the base template (`templates/base.html`)
use std::env;

#[derive(Debug, Clone)]
pub struct BaseStore {
    /// `SITE_NAME` variable
    pub site_name: String,
    /// `INFO_URL` variable, "what" in the footer
    pub info_url: String,
    /// `BODY_EMBED` variable, HTML that is embedded on every page
    pub body_embed: String,
    /// `USE_STARSTRAW` variable, for starstraw auth (disabled if not provided)
    pub starstraw: bool,
    /// `SECRET` variable, "true" makes the footer not link to the source
    pub secret: bool,
}

impl BaseStore {
    pub fn new() -> Self {
        Self {
            site_name: match env::var("SITE_NAME") {
                Ok(s) => s,
                Err(_) => String::from("Sealable"),
            },
            info_url: match env::var("INFO_URL") {
                Ok(s) => s,
                Err(_) => String::new(),
            },
            body_embed: match env::var("BODY_EMBED") {
                Ok(s) => s,
                Err(_) => String::new(),
            },
            starstraw: match env::var("USE_STARSTRAW") {
                Ok(s) => s == "true",
                Err(_) => false,
            },
            secret: match env::var("SECRET") {
                Ok(s) => s == "true",
                Err(_) => false,
            },
        }
    }
}
