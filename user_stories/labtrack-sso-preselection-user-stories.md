# LabTrack SSO pre-selection: user stories (Calira API)

Supports SOW item 3.2 (Authentication and MFA fatigue). Covers the `app-clustermarket` side only.

[[_TOC_]]

## Summary

Two stories let a LabTrack install send its lab ID on the OAuth authorize request, so a scientist lands on their organisation's SSO page without choosing "Login via organisation", searching for a tenant or picking a provider.

The LabTrack client change (send `lab_id`, remove the injected button-clicking JavaScript) is delivered by Itransition. MFA prompts at the customer's identity provider are unchanged. This work removes the selection steps only.

| # | Story | Size | Depends on |
| --- | --- | --- | --- |
| 1 | Resolve the lab's identity provider when LabTrack starts authorization | S | none |
| 2 | Sign-in page pre-selects the provider and starts SSO automatically | M | 1 (can be built against a stubbed session) |

Sizes are relative (S under a day or two, M a few days) and for the team to re-estimate.

## Decisions already made

- The sign-in page auto-submits the existing SSO form. SAML sign-in must be started by a POST (`post '/users/auth/saml/:identity_provider_id'` in `config/routes/authentication_routes.rb`), so a plain redirect from the authorize endpoint cannot start it.
- The lab ID arrives as a parameter on `/oauth/authorize` and is resolved in Doorkeeper's `resource_owner_authenticator` (`config/initializers/doorkeeper.rb`).
- If `lab_id` is missing or unknown, or the lab has no identity provider, behaviour is exactly as today (standard sign-in page). Older LabTrack versions are unaffected.
- Only special-purpose OAuth applications (`Doorkeeper::Application.special_purpose?`) get this behaviour.
- No escape link is needed. LabTrack's own login screen has a native email and password form (the OAuth password grant), and the embedded SSO web view only opens when the user clicks "Login via your organisation".
- `lab_id` is the working parameter name. The team confirms the final name to Itransition (Story 1).

## How it fits together today

1. LabTrack opens `/oauth/authorize?client_id=...&redirect_uri=clustermarket://oauth&response_type=code&scope=...` in an embedded browser with no persistent cookies, so the user is always signed out.
2. `resource_owner_authenticator` stores `request.fullpath` in `session[:user_return_to]` and redirects to `new_user_session_path` (`/login`, `Users::SessionsController#new`, view `app/views/users/sessions/new.html.erb`).
3. The page renders the `DynamicLoginForm` Svelte component (`app/javascript/components/user_auth/DynamicLoginForm.svelte`), which shows `SsoLoginForm.svelte` with a provider search (`ProviderSelect.svelte`, backed by `Api::SSO::IdentityProvidersController`).
4. Submitting posts to `/users/auth/saml/:id` (or Shibboleth). The IdP callback is handled by `Users::OmniauthCallbacksController`, which signs the user in and returns them to the stored authorize request. Special-purpose apps skip the consent screen (`skip_authorization` in the Doorkeeper config), so the authorization code goes straight to `clustermarket://oauth`.

The provider for a lab is already available: `Account#identity_provider` (`app/models/account.rb:263`) returns `designated_idp || department&.designated_idp || organisation&.designated_idp`.

A similar pre-selection hook already exists for invitations: `AuthenticationHelper#invitation_options` (`app/helpers/authentication_helper.rb`) builds an `{ label, id, strategy }` hash that the page passes as `enforcedIDP`.

---

## Story 1: Resolve the lab's identity provider at authorize time

**As a** scientist using LabTrack on a lab instrument,
**I want** Calira to recognise which lab my LabTrack install belongs to when I start signing in,
**so that** the system knows which organisation's SSO I should use without my choosing it.

### Where to work

- `config/initializers/doorkeeper.rb`, `resource_owner_authenticator` block (the `else` branch that redirects to `new_user_session_path`).
- A new small service object, for example `SSO::LabProviderResolver`, in `app/service_objects/`, so the initializer stays thin and the logic is unit-testable.
- `Account#identity_provider` (`app/models/account.rb:263`) for the lookup, and `Doorkeeper::Application.special_purpose?( params[:client_id] )` for the guard (`app/lib/doorkeeper/extensions/application.rb:37`).
- `doc/sso/` and `doc/external_api/external_api.mkd` for the contract documentation.

### Design constraints

- Resolve only when the user is not signed in, `params[:lab_id]` is present, and `params[:client_id]` belongs to a special-purpose application.
- Look up with `Account.find_by( id: )`, accepting only an integer that identifies a lab account (confirm the lab-type check against the `Account` model). Anything else is ignored silently.
- Store the result in the **session**, not in the URL: `{ id:, label:, strategy: }`, matching the shape `invitation_options` produces. Do not accept `lab_id` on `/login` itself. Otherwise anyone could probe `/login?lab_id=N` to map lab numbers to organisation names.
- Clear the stored value once the sign-in page has used it, and on sign-in.
- Write one structured log line per resolution (`hit`, `no_idp`, `unknown_lab`, `ignored_app`) with no user data, so support can diagnose a customer's complaint.

### Acceptance criteria

- [ ] Given a special-purpose app, a signed-out user and a `lab_id` of a lab with a SAML provider, when `/oauth/authorize` is requested, then the response is the usual redirect to `/login` and the session holds that provider's id, label and `saml` strategy. `session[:user_return_to]` is unchanged and still contains the full authorize URL.
- [ ] Given the lab inherits its provider from its department or organisation, then that provider is stored.
- [ ] Given a Shibboleth provider, then strategy is `shibboleth`.
- [ ] Given a lab with no provider, an unknown or non-numeric `lab_id`, or no `lab_id`, then nothing is stored and behaviour is identical to today.
- [ ] Given a non-special-purpose OAuth app with a valid `lab_id`, then nothing is stored.
- [ ] Given a signed-in user, then `lab_id` has no effect.
- [ ] Request specs in `spec/requests/oauth/authorization_request_spec.rb` cover each case above.
- [ ] The `lab_id` parameter is documented: what it is, who may use it, the fallback behaviour, and that it is additive so clients that don't send it are unaffected.
- [ ] The final parameter name is confirmed in writing to Itransition.

---

## Story 2: Sign-in page pre-selects the provider and starts SSO automatically

**As a** scientist,
**I want** the sign-in page to go straight to my organisation's SSO page when LabTrack has told Calira my lab,
**so that** I skip the organisation selection steps every time I sign in.

### Where to work

- `app/helpers/authentication_helper.rb`: add a helper next to `invitation_options` that reads and consumes the session value from Story 1 and returns the `{ label, id, strategy }` hash.
- `app/views/users/sessions/new.html.erb`: pass it to `DynamicLoginForm` as a new prop (for example `preselected_idp`).
- `app/javascript/components/user_auth/DynamicLoginForm.svelte` and `sso/SsoLoginForm.svelte`: treat the new prop as the selected provider (the form already computes its POST action from `selectedProvider` for both SAML and Shibboleth) and submit the form once on mount.
- `spec/requests/oauth/authorization_request_spec.rb` and `spec/requests/authentication/saml_request_spec.rb` for the end-to-end spec.

### Design constraints

- Do not reuse `enforcedIDP` for this. That prop disables the direct login toggle (`toggleForm` returns early), which changes the page for a different purpose. Add a separate prop.
- Submit exactly once per page load. If the user presses Back from the IdP and returns to `/login`, they must not be thrown back to the IdP in a loop: consume the session value when rendering (so a reload shows the normal page), or use an equivalent one-time guard. Pick the mechanism early in the work.
- The form needs the CSRF token it already includes (`AuthTokenInput`). Keep the `origin` handling for invitations unchanged.
- Show a short "Taking you to <organisation name>..." state, with a visible fallback button if auto-submit is blocked or fails.
- `Users::OmniauthCallbacksController#authenticate_or_verify_for` calls `store_location_for( :user, omniauth_origin )`. Confirm the stored authorize request survives this when no `origin` parameter is sent, so the user still returns to the authorize endpoint. This path already works for today's manual flow; the new flow must not regress it.

### Acceptance criteria

- [ ] Given the session from Story 1 holds a SAML provider, when `/login` loads, then the SSO form is submitted automatically to `/users/auth/saml/:id` with no tenant search or organisation click, and the browser lands on the provider's SSO page.
- [ ] Given a Shibboleth provider, then the Shibboleth form action is used.
- [ ] Given no pre-selection in the session, then `/login` renders exactly as today.
- [ ] Given the user presses Back from the IdP and returns to `/login`, then the page renders the normal sign-in page and does not auto-submit again.
- [ ] Given the invitation flow (`?invite_token=`), then it is unchanged.
- [ ] An end-to-end request spec passes: authorize with `lab_id`, follow the redirect to `/login`, post to the SAML endpoint, complete the callback, follow the stored return path, and assert the redirect to `clustermarket://oauth` with a code. It covers a provider on the lab itself, one inherited from the organisation, and the no-provider fallback.
- [ ] A request spec for `new` with and without the session value, and a Svelte/Vitest test for the single auto-submit.
- [ ] Existing sign-in specs (`spec/requests/authentication/session_request_spec.rb`) still pass.

---

## Dependency outside engineering

Itransition cannot verify the client change without a Calira test environment that contains this work:

- a lab linked to a working test SAML identity provider, with at least two test users
- a lab with no provider
- a special-purpose LabTrack OAuth application with the scopes LabTrack uses

Someone needs to own provisioning it and sharing the credentials securely.

## Out of scope

- Changes to the LabTrack client.
- Changes to how identity providers are configured, or MFA behaviour at the IdP.
- Reducing the need to sign in again (session length, remember me).
- New SSO providers.
- The participant log-on work (separate story).
- Any change to whether SSO-enforced accounts can sign in with a password.

## Risks and questions for the team

- **Multiple providers per hierarchy.** `Account#identity_provider` returns the first of lab, department, organisation. Confirm that is the intended order for labs that have providers at more than one level.
- **Lab type check.** Confirm which `Account` attribute marks a lab so a department or organisation ID is not accepted.
- **Rollout.** The behaviour is controlled by a request parameter that only the new LabTrack sends, so no feature flag is required. Say so if the team wants one anyway.
