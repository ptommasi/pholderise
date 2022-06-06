FROM registry.access.redhat.com/ubi8/nodejs-16 as builder

COPY --chown=1001:1001 . $HOME

RUN npm install && npm pack

FROM registry.access.redhat.com/ubi8/nodejs-16-minimal

LABEL name="pierpytom/pholderise" \
      vendor="Pierpaolo Tommasi" \
      version="0.0.42" \
      release="1" \
      summary="File organiser CLI application" \
      description="A basic command line tool to scatter multiple files (e.g. photos) under new subfolders based on their modification date."

## Switch user to root if you want the profile.d drop-in and/or the microdnf updates
# USER root

## profile.d is ignored (non login shell), therefore this line is useless
# RUN echo "export PATH=\$PATH:\$(npm config get prefix)/bin" > /etc/profile.d/fix_global_npm_path.sh

# Without squashing, updating the installed libraries take too much space (~100MB)
# RUN microdnf upgrade --refresh --best --nodocs --noplugins --setopt=install_weak_deps=0 && \
#     microdnf clean all

# No need to switch back user, in the end no root commands are executed
# USER 1001

COPY --from=builder $HOME/pholderise-*.tgz $HOME

RUN echo "export PATH=\$PATH:\$(npm config get prefix)/bin" > ~/.bashrc && \
    npm install -g pholderise-*.tgz

ENTRYPOINT [ "/bin/sh", "-c" ]
CMD [ "tail", "-f","/dev/null"]
