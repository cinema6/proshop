# ProShop

## v0.7.9 (September 29, 2015)

* *[v0.7.9]*
  * [DEV]: Fix for an issue where the custom ACE Angular directive
    file dependency was breaking the ACE editor
* *[/v0.7.9]*

## v0.7.8 (September 29, 2015)

* *[v0.7.8]*
  * [DEV]: Fix for an issue where the ACE library was being minified
    and included in the Require.js build and breaking the ACE editor
* *[/v0.7.8]*

## v0.7.7 (September 29, 2015)

* *[v0.7.7]*
  * [FIX]: Fix for an issue where a paginated list with zero results
    triggered extra requests
* *[/v0.7.7]*

## v0.7.6 (September 28, 2015)

* *[v0.7.6]*
  * [FIX]: Fix for an issue where ACE editor dependency was improperly
    loaded by require.js
* *[/v0.7.6]*

## v0.7.5 (September 28, 2015)

* *[v0.7.5]*
  * [DEV]: Advertisers, Customers and Categories lists no longer load every
    entity when displaying results. Results are fetched as users paginate.
    Filtering by column heading and searching by name now loads new
    results from the server.
  * [FEATURE]: Policy Manager
  * [FEATURE]: Roles Manager
  * [FEATURE]: Update User Manager to use roles and policies
* *[/v0.7.5]*

## v0.7.4 (June 15, 2015)

* *[v0.7.4]*
  * [FEATURE]: Handle 202 response from API
* *[/v0.7.4]*

## v0.7.3 (February 19, 2015)

* *[v0.7.3]*
  * [FIX]: Use hostname to determine correct MiniReel preview url
* *[/v0.7.3]*

## v0.7.2 (February 17, 2015)

* *[v0.7.2]*
  * [FEATURE]: Groups Manager
* *[/v0.7.2]*

## v0.7.1 (February 2, 2015)

* *[v0.7.1]*
  * [FIX]: Fixed bug where incorrect Site Container was removed when clicked
  * Category names are now read only once created
  * Advertiser and Publisher permissions are now being set for Sys Admin Users
* *[/v0.7.1]*

## v0.7.0 (February 2, 2015)

* *[v0.7.0]*
  * [FEATURE]: Advertiser Manager
  * [FEATURE]: Category Manager
  * [FEATURE]: Customer Manager
  * [FEATURE]: Site Container Manager
* *[/v0.7.0]*

## v0.6.16 (January 23, 2015)

* *[v0.6.16]*
  * Moved User permissions configuration into a Proshop experience
  * User management area is now route based
  * User application array is now set based on role
  * [FEATURE]: Deny access to Proshop if User does not have Proshop or MiniReelinator
    applications
  * [FIX]: When refreshing non-login pages we no longer make duplicate API calls
* *[/v0.6.16]*

## v0.6.15 (January 9, 2015)

* *[v0.6.15]*
  * [FIX]: Fix an issue where Angular is not passed into the Categories module
* *[/v0.6.15]*

## v0.6.14 (January 9, 2015)

* *[v0.6.14]*
  * [FIX]: Temporarily disable User Campaign permissions.
    Note: Because the Category and Site Container backend service is not ready
    the other features in this release (Category Manager and Site Container Manager)
    are being temporarily commented out and disabled
  * [FEATURE]: Added Category manager
  * [FEATURE]: Added Site container manager
* *[/v0.6.14]*

## v0.6.13 (December 11, 2014)

* *[v0.6.13]*
  * [FEATURE]: Added ability to enable the IFrame embed type for an Org
  * [FEATURE]: Added Wild Card placements to Sites
  * [FEATURE]: Added Campaign permissions for Sys Admin users
* *[/v0.6.13]*

## v0.6.12 (October 21, 2014)

* *[v0.6.12]*
    *[FEATURE]: Add sponsorship settings
* *[/v0.6.12]*

## v0.6.11 (October 8, 2014)

* *[v0.6.11]*
    *[FEATURE]: Add user status settings
    *[FIX]: Loosen valid email restrictions
* *[/v0.6.11]*

## v0.6.10 (October 3, 2014)

* *[v0.6.10]*
    *[FEATURE]: Add user Freeze button to log out and deactivate User
* *[/v0.6.10]*

## v0.6.9 (September 30, 2014)

* *[v0.6.9]*
    *[FIX]: Allow use of subdomains when creating/editing Sites.
* *[/v0.6.9]*

## v0.6.8 (September 26, 2014)

* *[v0.6.8]*
    *[FIX]: Allow unsetting of a Site's org property
* *[/v0.6.8]*

## v0.6.7 (September 26, 2014)

* *[v0.6.7]*
    *[FIX]: Ensure Users have correct access to Site data
* *[/v0.6.7]*

## v0.6.6 (September 25, 2014)

* *[v0.6.6]*
    *[FIX]: Ensure that Org dropdown is reset when editing Sites with no Org
* *[/v0.6.6]*

## v0.6.5 (September 25, 2014)

* *[v0.6.5]*
    *[FIX]: Table results are no longer disabled if there are errors fetching data
    *[FIX]: Creating and editing a Site no longer requires an Org
* *[/v0.6.5]*

## v0.6.4 (September 24, 2014)

* *[v0.6.4]*
    *[FEATURE]: Enable choice of MiniReel branding when copying
    *[FIX]: Remove User branding settings
    *[FEATURE]: Disable table results until data has completely loaded
    *[FIX]: Ensure that paginated results reset when search results are changes
    *[FEATURE]: Expose Sites settings UI
* *[/v0.6.4]*

## v0.6.3 (September 12, 2014)

* *[v0.6.3]*
    *[FEATURE]: Add User roles: Admin, Publisher, Content Provider
* *[/v0.6.3]*

## v0.6.2 (September 11, 2014)

* *[v0.6.2]*
    *[FEATURE]: Add ability to create System Admin Users
* *[/v0.6.2]*

## v0.6.1 (September 9, 2014)

* *[v0.6.1]*
    *[FIX]: Fix paginator controls styles in Firefox
    *[FEATURE]: Add controls for User's ability to edit ad config settings
* *[/v0.6.1]*

## v0.6.0 (September 9, 2014)

* *[v0.6.0]*
    *[FEATURE]: Add pagination on Users, Orgs and Minireels pages
* *[/v0.6.0]*

## v0.5.4 (August 25, 2014)

* *[v0.5.4]*
    *[FIX]: Make sure minireel ad configuration isn't copied during copy process
* *[/v0.5.4]*

## v0.5.3 (August 25, 2014)

* *[v0.5.3]*
    *[FIX]: Minireel table properly displays branding
    *[FEATURE]: Ability to copy a minireel from one Org to another
* *[/v0.5.3]*

## v0.5.2 (August 12, 2014)

* *[v0.5.2]*
    *[FIX]: Stop Minireel section from initializing with previously viewed Org data
* *[/v0.5.2]*

## v0.5.1 (August 12, 2014)

* *[v0.5.1]*
    *[FIX]: Better error handling and alerts
    *[FIX]: Get rid of unnecessary table columns, replace with useful ones
    *[FEATURE]: Convert new Org name into branding until user edits branding separately
    *[FIX]: Trim and block all leading/trailing spaces in input fields
    *[FEATURE]: Add toggle for Org options in Add/Edit UI
    *[FIX]: Drop downs are sorted alphabetically expect for "Last Updated" which is chronological
    *[FEATURE]: Link to Show/Hide password
    *[FIX]: Warn user and ask for confirmation beofre changing a User's Org
    *[FIX]: A User's branding defaulkts to the Org's branding if the User's is not defined
* *[/v0.5.1]*

## v0.5.0 (August 7, 2014)

* *[v0.5.0]*
    *[FEATURE]: Existing user's org is now editable
    *[FEATURE]: Table headings for All Users and All Orgs will sort data
    *[FEATURE]: Added User Type setting
    *[FEATURE]: Added Org minireelinator settings
    *[FEATURE]: Org and User config data is structured correctly
    *[FEATURE]: Added Minireel area that allows for searching and copying of minireels
    *[FIX]: User email is properly validated to field
* *[/v0.5.0]*

## v0.4.2 (August 4, 2014)

* *[v0.4.3]*
    *[FIX]: Org Embed Type changes are now properly saved
* *[/v0.4.3]*

## v0.4.2 (August 4, 2014)

* *[v0.4.2]*
    *[FIX]: Org documents are properly converted for editing in the UI
* *[/v0.4.2]*

## v0.4.1 (August 1, 2014)

* *[v0.4.1]*
    *[FIX]: Saving a user now sends the config block
    *[FIX]: Orgs' configuration settings are properly populated in the UI
* *[v0.4.1]*

## v0.4.0 (August 1, 2014)

* *[v0.4.0]*
    *[FEATURE]: Ability to delete Users and Orgs. Orgs with Users cannot be deleted
    *[FEATURE]: Ability to configure waterfall settings for video and display ads
    *[FEATURE]: Ability to configure dynamic ad settings (first ad placement, frequency and skip)
    *[FEATURE]: Ability to configure default splash settings for Users of the MR Studio
    *[FEATURE]: Ability to configure embed types settings for Orgs in the MR Studio
* *[/v0.4.0]*

## v0.3.0 (July 30, 2014)

* *[v0.3.0]*
    *[FIX]: Users' Email and Organization is no longer editable once it's been created
    *[FIX]: Users from a previously viewed Org no longer appear when adding a new Org
    *[FIX]: Get rid of useless ID column in Users and Orgs table, add a Name column for Users
    *[FEATURE]: Ability to add and edit the Branding field for new and existing Users
* *[/v0.3.0]*
