FROM node:lts-bullseye-slim AS nodebase
WORKDIR /app
RUN npm install npm@10.9.1 --global --no-audit --no-fund --no-update-notifier --loglevel verbose

FROM nodebase AS motif
WORKDIR /app
COPY "." "."
ARG GIT_COMMIT=Unknown
RUN <<EOT
    npm config delete script-shell --location project
    npm install node-jq --global --no-audit --no-fund --no-update-notifier --loglevel verbose
    npm clean-install --no-audit --no-fund --no-update-notifier
	Version=$(cat package.json | npx node-jq .version --raw-output)
	echo "export namespace Version { export const app = '$Version'; export const commit = '${GIT_COMMIT}'; }" > src/generated/version.ts
	echo -n "$Version" > src/generated/version.txt
    npm run build:docker
EOT

FROM nodebase AS highcharts
WORKDIR /app
COPY --from=highchartscontext "." "."
RUN <<EOT
    npm config delete script-shell --location project
    npm clean-install --no-audit --no-fund --no-update-notifier
    npm run dist
EOT

FROM nodebase AS tsdemo
WORKDIR /app
COPY --from=tsdemocontext "." "."
RUN <<EOT
    npm config delete script-shell --location project
    npm clean-install --no-audit --no-fund --no-update-notifier
    npm run dist
EOT

FROM nodebase AS websiteembed
WORKDIR /app
COPY --from=websiteembedcontext "." "."
RUN <<EOT
    npm config delete script-shell --location project
    npm clean-install --no-audit --no-fund --no-update-notifier
    npm run dist
EOT

# FROM nginx:stable-alpine AS final
# RUN apk upgrade --no-cache
FROM nginx:stable AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=motif /app/dist /app
COPY --from=highcharts /app/dist /app/browser/extensions/highcharts
COPY --from=tsdemo /app/dist /app/browser/extensions/ts-demo
COPY --from=websiteembed /app/dist /app/browser/extensions/website-embed
