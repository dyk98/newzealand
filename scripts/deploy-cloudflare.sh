#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${CF_PAGES_PROJECT_NAME:-newzealand}"
PRODUCTION_BRANCH="${CF_PAGES_BRANCH:-main}"
DOMAIN="${CF_PAGES_DOMAIN:-newzealand.castaly.site}"
PAGES_TARGET="${CF_PAGES_TARGET:-newzealand-e82.pages.dev}"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-fbe04ccb1b97131b2bda03a81836a4c4}"
ZONE_ID="${CLOUDFLARE_ZONE_ID:-96f7311bc2550a974a6fead412eea684}"
TOKEN_FILE="${CLOUDFLARE_TOKEN_FILE:-/root/castaly/.runtime/secrets/cloudflare-api-token.env}"
WORKER_BYPASS_PATTERN="${DOMAIN}/*"
API_BASE="https://api.cloudflare.com/client/v4"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

load_cloudflare_token() {
  if [[ -f "$TOKEN_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$TOKEN_FILE"
    set +a
  fi

  if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    echo "Missing CLOUDFLARE_API_TOKEN. Expected it in $TOKEN_FILE or the environment." >&2
    exit 1
  fi

  export CLOUDFLARE_API_TOKEN
  export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"
}

cf_api() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local args=(-sS -X "$method" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json")

  if [[ -n "$body" ]]; then
    args+=(--data "$body")
  fi

  curl "${args[@]}" "$API_BASE$path"
}

ensure_success() {
  local response="$1"
  local action="$2"

  if [[ "$(jq -r '.success' <<<"$response")" != "true" ]]; then
    echo "$action failed:" >&2
    jq '.errors' <<<"$response" >&2
    exit 1
  fi
}

ensure_dependencies() {
  require_command curl
  require_command jq
  require_command npm

  if [[ ! -x node_modules/.bin/vite || ! -x node_modules/.bin/tsc ]]; then
    npm ci
  fi
}

ensure_pages_project() {
  local response
  response="$(cf_api GET "/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME")"

  if [[ "$(jq -r '.success' <<<"$response")" == "true" ]]; then
    return
  fi

  npx wrangler pages project create "$PROJECT_NAME" --production-branch "$PRODUCTION_BRANCH"
}

ensure_pages_domain() {
  local response create_response
  response="$(cf_api GET "/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains/$DOMAIN")"

  if [[ "$(jq -r '.success' <<<"$response")" == "true" ]]; then
    return
  fi

  create_response="$(cf_api POST "/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" "$(jq -nc --arg name "$DOMAIN" '{name: $name}')")"
  ensure_success "$create_response" "Create Pages custom domain"
}

ensure_dns_record() {
  local response count record_id current_type current_content current_proxied update_response create_response

  response="$(curl -sS -G -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" "$API_BASE/zones/$ZONE_ID/dns_records" --data-urlencode "name=$DOMAIN")"
  ensure_success "$response" "Read DNS record"

  count="$(jq '.result | length' <<<"$response")"
  if [[ "$count" -gt 1 ]]; then
    echo "Multiple exact DNS records exist for $DOMAIN; refusing to choose one." >&2
    jq '.result[] | {id, type, name, content, proxied}' <<<"$response" >&2
    exit 1
  fi

  if [[ "$count" -eq 0 ]]; then
    create_response="$(
      cf_api POST "/zones/$ZONE_ID/dns_records" "$(
        jq -nc --arg name "$DOMAIN" --arg content "$PAGES_TARGET" \
          '{type: "CNAME", name: $name, content: $content, ttl: 1, proxied: true}'
      )"
    )"
    ensure_success "$create_response" "Create DNS CNAME"
    return
  fi

  record_id="$(jq -r '.result[0].id' <<<"$response")"
  current_type="$(jq -r '.result[0].type' <<<"$response")"
  current_content="$(jq -r '.result[0].content' <<<"$response")"
  current_proxied="$(jq -r '.result[0].proxied' <<<"$response")"

  if [[ "$current_type" == "CNAME" && "$current_content" == "$PAGES_TARGET" && "$current_proxied" == "true" ]]; then
    return
  fi

  update_response="$(
    cf_api PUT "/zones/$ZONE_ID/dns_records/$record_id" "$(
      jq -nc --arg name "$DOMAIN" --arg content "$PAGES_TARGET" \
        '{type: "CNAME", name: $name, content: $content, ttl: 1, proxied: true}'
    )"
  )"
  ensure_success "$update_response" "Update DNS CNAME"
}

ensure_worker_bypass_route() {
  local response route_id route_script create_response update_response

  response="$(cf_api GET "/zones/$ZONE_ID/workers/routes?per_page=100")"
  ensure_success "$response" "Read Worker routes"

  route_id="$(jq -r --arg pattern "$WORKER_BYPASS_PATTERN" '.result[]? | select(.pattern == $pattern) | .id' <<<"$response" | head -n 1)"

  if [[ -z "$route_id" ]]; then
    create_response="$(cf_api POST "/zones/$ZONE_ID/workers/routes" "$(jq -nc --arg pattern "$WORKER_BYPASS_PATTERN" '{pattern: $pattern, script: null}')")"
    ensure_success "$create_response" "Create Worker bypass route"
    return
  fi

  route_script="$(jq -r --arg id "$route_id" '.result[] | select(.id == $id) | (.script // "null")' <<<"$response")"
  if [[ "$route_script" == "null" ]]; then
    return
  fi

  update_response="$(cf_api PUT "/zones/$ZONE_ID/workers/routes/$route_id" "$(jq -nc --arg pattern "$WORKER_BYPASS_PATTERN" '{pattern: $pattern, script: null}')")"
  ensure_success "$update_response" "Update Worker bypass route"
}

verify_public_site() {
  local html_file js_path css_path status domain_response domain_status validation_status
  html_file="$(mktemp)"
  trap 'rm -f "${html_file:-}"' RETURN

  status="$(curl -L -sS -o "$html_file" -w '%{http_code}' "https://$DOMAIN")"
  if [[ "$status" != "200" ]]; then
    echo "Public verification failed: https://$DOMAIN returned HTTP $status" >&2
    exit 1
  fi

  if ! grep -q '<div id="root">' "$html_file"; then
    echo "Public verification failed: root element not found in HTML." >&2
    exit 1
  fi

  js_path="$(grep -o '/assets/[^"]*\.js' "$html_file" | head -n 1)"
  css_path="$(grep -o '/assets/[^"]*\.css' "$html_file" | head -n 1)"

  if [[ -n "$js_path" ]]; then
    curl -fsSI "https://$DOMAIN$js_path" >/dev/null
  fi
  if [[ -n "$css_path" ]]; then
    curl -fsSI "https://$DOMAIN$css_path" >/dev/null
  fi

  domain_response="$(cf_api GET "/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains/$DOMAIN")"
  ensure_success "$domain_response" "Read Pages custom domain"
  domain_status="$(jq -r '.result.status // "unknown"' <<<"$domain_response")"
  validation_status="$(jq -r '.result.validation_data.status // "unknown"' <<<"$domain_response")"

  echo "Deployed: https://$DOMAIN"
  echo "Pages domain status: $domain_status; validation: $validation_status"
}

main() {
  ensure_dependencies
  load_cloudflare_token
  ensure_pages_project

  npm run build
  npx wrangler pages deploy dist --project-name "$PROJECT_NAME" --branch "$PRODUCTION_BRANCH" --commit-dirty=true

  ensure_pages_domain
  ensure_dns_record
  ensure_worker_bypass_route
  verify_public_site
}

main "$@"
