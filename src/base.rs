//! Base values for the base template (`templates/base.html`)
use std::env;

#[derive(Debug, Clone)]
pub struct BaseStore {
    /// `SITE_NAME` variable
    pub site_name: String,
    /// `INFO_URL` variable, "what" in the footer
    pub info_url: String,
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
        }
    }
}
