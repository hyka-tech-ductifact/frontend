set -euo pipefail
cd src/app

# 1. Move the cross-domain service to core and delete the orphan duplicate model
mv views/clients/pages/client-projects/services/client-projects.service.ts core/services/
rmdir views/clients/pages/client-projects/services
rm -rf views/clients/models

# 2. Rename nested dumb-component folders from `pages/` to `components/`
mv views/clients/pages/client-projects/pages views/clients/pages/client-projects/components
mv views/clients/pages/new-project/pages     views/clients/pages/new-project/components
mv views/settings/pages                      views/settings/components

# 3. Flatten clients/pages and auth/pages
mv views/clients/pages/* views/clients/
rmdir views/clients/pages
mv views/auth/pages/login views/auth/login
rmdir views/auth/pages

# 4. Fix import paths
perl -pi -e "s#'\./pages/#'./components/#g" views/clients/client-projects/client-projects.component.ts views/clients/new-project/new-project.component.ts
perl -pi -e "s#'\./pages/settings-#'./components/settings-#g" views/settings/settings.component.ts
perl -pi -e "s#import\('\./pages/#import('./#g; s#'\./pages/#'./#g" views/clients/client.routes.ts
perl -pi -e "s#views/auth/pages/login/#views/auth/login/#" app.routes.ts
perl -pi -e "s#'\./services/client-projects\.service'#'core/services/client-projects.service'#" views/clients/client-projects/client-projects.component.ts
perl -pi -e "s#'\.\./client-projects/services/client-projects\.service'#'core/services/client-projects.service'#" views/clients/new-project/new-project.component.ts
perl -pi -e "s#'\.\./\.\./clients/pages/client-projects/services/client-projects\.service'#'core/services/client-projects.service'#" views/orders/order/order.component.ts

# Recompute the `core/` relative depth for every file under views/
find views -name '*.ts' ! -name '*.spec.ts' | while read -r f; do
  up=$(dirname "$f" | awk -F/ '{s=""; for(i=1;i<=NF;i++) s=s"../"; print s}')
  perl -pi -e "s#'(?:\.\./)*core/#'${up}core/#g" "$f"
done

# The moved service sits in core/services, so fix its own imports
perl -pi -e "s#'(?:\.\./)+environments/#'../../../environments/#; s#'(?:\.\./)+core/models/#'../models/#" core/services/client-projects.service.ts

cd ../.. && npx tsc -p tsconfig.app.json --noEmit
