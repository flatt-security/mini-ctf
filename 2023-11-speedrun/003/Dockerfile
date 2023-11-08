FROM ruby:3.2.2-bookworm AS build

WORKDIR /app

COPY Gemfile* ./
RUN bundle config --global frozen 1
RUN bundle install

FROM ruby:3.2.2-slim-bookworm

RUN useradd -u 1001 -m ctf

WORKDIR /home/ctf

COPY --from=build /usr/local/bundle /usr/local/bundle
COPY config ./config
COPY config.ru Gemfile* server.rb ./

USER ctf

ENV RACK_ENV=production

CMD ["bundle", "exec", "puma"]
