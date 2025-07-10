FROM node:lts AS base
WORKDIR /src
RUN <<EOT
	npm install npm@10.9.1 --global --no-audit --no-fund --no-update-notifier --loglevel verbose
	npm install node-jq --global --no-audit --no-fund --no-update-notifier --loglevel verbose
EOT
COPY "package.json" "package-lock.json" "./"
COPY "motif/package.json" "motif/"
COPY "extensions/highcharts/package.json" "extensions/highcharts/"
COPY "extensions/ts-demo/package.json" "extensions/ts-demo/"
COPY "extensions/website-embed/package.json" "extensions/website-embed/"
RUN npm clean-install --no-audit --no-fund --no-update-notifier

FROM base AS motifbase
WORKDIR /src/motif
COPY "motif" "."
ARG GIT_COMMIT=Unknown
RUN <<EOT
	Version=$(cat package.json | npx node-jq .version --raw-output)
	echo "export namespace Version { export const app = '$Version'; export const commit = '${GIT_COMMIT}'; }" > src/generated/version.ts
	echo -n "$Version" > src/generated/version.txt
EOT

FROM motifbase AS motif
RUN npm run build:docker

FROM motifbase AS lib
RUN npm run api

FROM base AS highcharts
WORKDIR /src/extensions/highcharts
COPY --from=lib /src/motif/lib /src/motif/lib/
COPY "extensions/highcharts" "."
RUN npm run build

FROM base AS tsdemo
WORKDIR /src/extensions/ts-demo
COPY --from=lib /src/motif/lib /src/motif/lib/
COPY "extensions/ts-demo" "."
RUN npm run build

FROM base AS webembed
WORKDIR /src/extensions/website-embed
COPY --from=lib /src/motif/lib /src/motif/lib/
COPY "extensions/website-embed" "."
RUN npm run build

FROM nginx:stable AS final
COPY motif/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=motif /src/motif/dist /app
COPY --from=highcharts /src/extensions/highcharts/dist /app/browser/extensions/highcharts
COPY --from=tsdemo /src/extensions/ts-demo/dist /app/browser/extensions/ts-demo
COPY --from=webembed /src/extensions/website-embed/dist /app/browser/extensions/website-embed
