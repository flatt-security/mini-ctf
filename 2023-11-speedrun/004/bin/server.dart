import 'dart:convert';
import 'dart:io' show Platform;

import 'package:chal/util.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:shelf_router/shelf_router.dart';
import 'package:shelf_static/shelf_static.dart';

Response json(Object? object, {status = 200}) {
  return Response(
    status,
    body: jsonEncode(object),
    headers: {
      'Content-Type': 'application/json',
    },
  );
}

void main() async {
  final router = Router()
    ..post('/api/login', (Request request) async {
      String? username;
      try {
        final body = jsonDecode(await request.readAsString());
        username = body['username'];
      } catch (e) {
        return json({}, status: 400);
      }

      if (username == 'admin') {
        return json({}, status: 403);
      }

      final loginToken = LoginToken(token: signJWT(username));
      return json(loginToken.toJson());
    })
    ..get('/api/flag', (Request request) {
      final authorization = request.headers['Authorization'];
      final token = authorization?.replaceFirst('Bearer ', '');
      final jwt = verifyJWT(token);
      if (jwt == null) {
        return json({}, status: 401);
      }

      if (jwt.subject != 'admin') {
        return json({}, status: 403);
      }

      return json(Flag(flag: Platform.environment['FLAG']).toJson());
    });

  final port = int.parse(Platform.environment['PORT'] ?? '3000');
  final handler = Cascade()
      .add(createStaticHandler('build', defaultDocument: 'index.html'))
      .add(router)
      .handler;
  await shelf_io.serve(handler, '0.0.0.0', port);
}
