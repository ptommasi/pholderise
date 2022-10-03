FROM node:16 as builder

WORKDIR /builder

COPY . /builder

RUN npm install && npm pack

FROM node:16-alpine

LABEL name="pierpytom/pholderise" \
      vendor="Pierpaolo Tommasi" \
      version="0.0.42" \
      release="1" \
      summary="File organiser CLI application" \
      description="A basic command line tool to scatter multiple files (e.g. photos) under new subfolders based on their modification date."

WORKDIR /app

COPY --from=builder /builder/pholderise-*.tgz /app

RUN echo "export PATH=\$PATH:\$(npm config get prefix)/bin" > ~/.bashrc && \
    npm install -g pholderise-*.tgz

ENTRYPOINT [ "/bin/sh", "-c" ]
CMD [ "tail", "-f","/dev/null"]
