FROM dart:3.1.5 AS build

WORKDIR /app

COPY pubspec.* ./
RUN dart pub get

COPY bin ./bin
COPY lib ./lib
COPY web ./web

RUN secret=$(head -c 16 /dev/urandom | sha256sum | awk '{print $1}') && \
    sed -i "s/<PLACEHOLDER>/$secret/g" lib/util.dart

RUN dart compile exe bin/server.dart -o bin/server
RUN dart pub run webdev build

FROM scratch

COPY --from=build /runtime/ /
COPY --from=build /app/bin/server /home/ctf/bin/server
COPY --from=build /app/build /home/ctf/build

WORKDIR /home/ctf

CMD ["/home/ctf/bin/server"]