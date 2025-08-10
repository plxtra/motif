FROM node:lts-bullseye-slim AS nodebase
WORKDIR /build
RUN npm install npm@10.9.1 --global --no-audit --no-fund --no-update-notifier --loglevel verbose

FROM nodebase AS motif
WORKDIR /build
COPY "package.json" "package-lock.json" "./"
RUN npm install node-jq --global --no-audit --no-fund --no-update-notifier --loglevel verbose
RUN npm clean-install --no-audit --no-fund --no-update-notifier
COPY "." "."
ARG GIT_COMMIT=Unknown
RUN <<EOT
    npm config delete script-shell --location project
	Version=$(cat package.json | npx node-jq .version --raw-output)
	echo "export namespace Version { export const app = '$Version'; export const commit = '${GIT_COMMIT}'; }" > src/generated/version.ts
	echo -n "$Version" > src/generated/version.txt
    npm run build:docker
EOT

FROM nodebase AS highcharts
WORKDIR /build
COPY --from=highchartscontext "package.json" "package-lock.json" "./"
RUN npm clean-install --no-audit --no-fund --no-update-notifier
COPY --from=highchartscontext "." "."
RUN <<EOT
    npm config delete script-shell --location project
    npm run dist
EOT

FROM nodebase AS tsdemo
WORKDIR /build
COPY --from=tsdemocontext "package.json" "package-lock.json" "./"
RUN npm clean-install --no-audit --no-fund --no-update-notifier
COPY --from=tsdemocontext "." "."
RUN <<EOT
    npm config delete script-shell --location project
    npm run dist
EOT

FROM nodebase AS websiteembed
WORKDIR /build
COPY --from=websiteembedcontext "package.json" "package-lock.json" "./"
RUN npm clean-install --no-audit --no-fund --no-update-notifier
COPY --from=websiteembedcontext "." "."
RUN <<EOT
    npm config delete script-shell --location project
    npm run dist
EOT

# FROM nginx:stable-alpine AS final
# RUN apk upgrade --no-cache
FROM nginx:stable AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=motif /build/dist /app
COPY --from=highcharts /build/dist /app/browser/extensions/highcharts
COPY --from=tsdemo /build/dist /app/browser/extensions/ts-demo
COPY --from=websiteembed /build/dist /app/browser/extensions/website-embed
