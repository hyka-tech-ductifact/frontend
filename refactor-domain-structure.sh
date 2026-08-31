#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-$PWD}"
cd "$ROOT_DIR"

if [[ ! -d "src/app" ]]; then
  echo "Error: src/app not found in $ROOT_DIR" >&2
  exit 1
fi

move_merge_dir() {
  local src="$1"
  local dst="$2"

  if [[ ! -d "$src" ]]; then
    return 0
  fi

  mkdir -p "$(dirname "$dst")"

  if [[ -d "$dst" ]]; then
    rsync -a "$src"/ "$dst"/
    rm -rf "$src"
  else
    mv "$src" "$dst"
  fi
}

echo "Preparing target roots..."
mkdir -p src/app/core
mkdir -p src/app/shared
mkdir -p src/app/views

echo "Moving layouts -> shared/layouts ..."
move_merge_dir "src/app/layouts" "src/app/shared/layouts"

echo "Moving features -> views ..."
if [[ -d "src/app/features" ]]; then
  for domain_path in src/app/features/*; do
    [[ -d "$domain_path" ]] || continue
    domain_name="$(basename "$domain_path")"

    if [[ "$domain_name" == "client" ]]; then
      domain_name="clients"
    fi

    move_merge_dir "$domain_path" "src/app/views/$domain_name"
  done
fi

echo "Moving pages -> views/<domain>/pages ..."
if [[ -d "src/app/pages" ]]; then
  for domain_path in src/app/pages/*; do
    [[ -d "$domain_path" ]] || continue
    domain_name="$(basename "$domain_path")"
    move_merge_dir "$domain_path" "src/app/views/$domain_name/pages"
  done
fi

echo "Rewriting root-level imports..."
perl -pi -e "s#(from\\s+['\"])\\./layouts/#\\1./shared/layouts/#g" src/app/app.component.ts
perl -pi -e "s#(import\\(['\"])\\./features/auth/#\\1./views/auth/#g" src/app/app.routes.ts
perl -pi -e "s#(import\\(['\"])\\./features/client/#\\1./views/clients/#g" src/app/app.routes.ts

echo "Fixing moved client route references..."
if [[ -f "src/app/views/clients/client.routes.ts" ]]; then
  perl -pi -e "s#import\\('../../pages/clients/new-client/new-client\\.component'\\)#import('./pages/new-client/new-client.component')#g" src/app/views/clients/client.routes.ts
fi

echo "Fixing moved new-client component import depth..."
if [[ -f "src/app/views/clients/pages/new-client/new-client.component.ts" ]]; then
  perl -pi -e "s#from '\\.\\./\\.\\./\\.\\./core/#from '../../../../core/#g" src/app/views/clients/pages/new-client/new-client.component.ts
  perl -pi -e 's#from "\\.\\./\\.\\./\\.\\./core/#from "../../../../core/#g' src/app/views/clients/pages/new-client/new-client.component.ts
fi

echo "Removing empty legacy folders..."
find src/app -type d -empty -delete

echo "Done."
echo "Next: run npm run start or npm run test to validate imports and routes."
